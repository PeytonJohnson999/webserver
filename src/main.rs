/******************************************************************************
Welcome to GDB Online.
GDB online is an online compiler and debugger tool for C, C++, Python, Java, PHP, Ruby, Perl,
C#, OCaml, VB, Swift, Pascal, Fortran, Haskell, Objective-C, Assembly, HTML, CSS, JS, SQLite, Prolog.
Code, Compile, Run and Debug online from anywhere in world.

*******************************************************************************/
#![allow(warnings)]
// #![feature(string_remove_matches)]

use std::{
    fs::{self, File}, 
    io::{self, BufRead, BufReader, ErrorKind, Read, Write}, path::Display, str::FromStr //net::{TcpListener, TcpStream}
};

use anyhow::anyhow;
use tokio::{
    // fs::{self, File},
    io::{AsyncBufRead, AsyncReadExt, AsyncWrite, BufStream, AsyncWriteExt, AsyncBufReadExt, AsyncRead},
    net::{TcpListener, TcpStream},
};


use resp::*;
use req::*;

#[tokio::main]
async fn main() -> std::io::Result<()>{

    let mut port = 7878;
    let listener: TcpListener = loop{
        match TcpListener::bind(format!("127.0.0.1:{port}")).await {
            Ok(l) => {println!("chosen port: {port}"); break l},
            Err(e) => match e.kind() {
                ErrorKind::AddrInUse => {
                    if port == 65535{
                        port = 0;
                    }
                    port += 1;
                    continue;
                },
                _ => panic!("Error: {e:?}"),
            }
        }
    };
    
    
    loop{
        let (stream, _addr) = listener.accept().await?;
        let mut stream = BufStream::new(stream);
        println!("Connection Established!");
        tokio::spawn(async move{
            let mut buf: Vec<u8> = Vec::new();

            loop {

                let request = match parse_request(&mut stream).await{
                    Ok(r) => r,
                    Err(e) => {
                        // let mut req = String::new();
                        // stream.read_line(&mut req);
                        panic!("Error parsing req, Root cause: {}",e.root_cause())},
                };
                let method = request.method;
                // println!("Path: {}", request.path);
                
                //Index & portfolio
                if method == Method::GET && (request.path.trim() == "/" || request.path.trim() == "/index.html" ||
                request.path.trim() == "/html/index.html"){

                    // println!("Index request");
                    send_page("html/index.html", ContentType::html, &mut stream).await.unwrap();

                } else if method == Method::GET && (request.path.trim() == "/portfolio.html" ||
                request.path.trim() == "/html/portfolio.html"
                ){
                    send_page("html/portfolio.html", ContentType::html, &mut stream).await.unwrap();

                //Basic CSS
                }else if method == Method::GET && request.path.trim() == "/css/style.css"{
                    send_page("css/style.css", ContentType::css, &mut stream).await.unwrap();

                }else if method == Method::GET{
                    let mut path = request.path.trim().to_string();
                    path.remove(0);
                    match send_page(path.clone(), ContentType::from_str(&path).unwrap(), &mut stream).await {
                        Ok(()) => (),
                        Err(e) => match e.root_cause().to_string().as_str() {
                            "No such file or directory (os error 2)" => {
                                if path.contains("html"){
                                    send_page("html/404.html", ContentType::html, &mut stream).await.unwrap()
                                }
                            },
                            _ => panic!("Error sending page: {e}")
                        },
                    };

                //404 html
                }else if request.path.trim().contains(".html"){
                    eprintln!("404 error");
                    eprintln!("req: {request:?}");
                    let response = Response::err404Page();

                    response.write(&mut stream).await.unwrap();

                //General 404
                }else{

                    eprintln!("404 error");
                    eprintln!("req: {request:?}");
                    let response = Response::err404();

                    response.write(&mut stream).await.unwrap();
                }
            }
        });
            
    }
    
    Ok(())
}

async fn send_page<S>(path: S , content_type: ContentType, stream: &mut BufStream<TcpStream>) -> Result<(), anyhow::Error>
where
    S: ToString
{
    let path = path.to_string();
    let mut file = match fs::File::open(path.clone()){
        Ok(f) => f,
        Err(e) => {
            eprintln!("Could not find file: {} while sending page", path);
            return Err(e.into())
        },
    };
    let mut bytes = Vec::new();
    let len = file.read_to_end(&mut bytes).unwrap();

    let headers = maplit::hashmap! {
        "Content-Type".to_owned() => content_type.to_string(),
        "Content-Length".to_owned() => len.to_string(),
    };

    let resp = Response{
        status: Status::Ok,
        headers,
        payload: io::Cursor::new(bytes),
    };

    resp.write(stream).await?;

    Ok(())
}

mod req{
    use std::collections::HashMap;
    use anyhow::anyhow;
    use tokio::io::{AsyncBufRead, AsyncBufReadExt};

    #[derive(Debug, Clone)]
    pub struct Request{
        pub method: Method,
        pub path: String,
        headers: HashMap<String, String>,
    }

    #[derive(PartialEq, Eq, Debug, Clone, Copy)]
    pub enum Method{
        GET,

    }

    impl TryFrom<&str> for Method{
        type Error = anyhow::Error;

        fn try_from(value: &str) -> std::result::Result<Self, Self::Error> {
            match value{
                "GET" => Ok(Method::GET),
                m => Err(anyhow!("Invalid method: {m}")),
            }
        }
    }

    pub async fn parse_request(mut stream: impl AsyncBufRead + Unpin) -> anyhow::Result<Request> {
        let mut line_buffer = String::new();
        stream.read_line(&mut line_buffer).await?;

        let mut parts = line_buffer.split_whitespace();

        let method: Method = parts
            .next()
            .ok_or({
                
                anyhow::anyhow!("missing method in req: {}", line_buffer)
            })
            .and_then(TryInto::try_into)?;

        let path: String = parts
            .next()
            .ok_or(anyhow::anyhow!("missing path"))
            .map(Into::into)?;

        let mut headers = HashMap::new();

        loop {
            line_buffer.clear();
            stream.read_line(&mut line_buffer).await?;

            if line_buffer.is_empty() || line_buffer == "\n" || line_buffer == "\r\n" {
                break;
            }

            let mut comps = line_buffer.split(":");
            let key = comps.next().ok_or(anyhow::anyhow!("missing header name"))?;
            let value = comps
                .next()
                .ok_or(anyhow::anyhow!("missing header value"))?
                .trim();

            headers.insert(key.to_string(), value.to_string());
        }

        Ok(Request {
            method,
            path,
            headers,
        })
    }
}

mod resp{
    use std::{
        collections::HashMap, fs::{self}, hash::Hash, io::{self, Bytes, Cursor, Read}, str::FromStr
    };

    use anyhow::Ok;
    use tokio::io::{
        AsyncRead, 
        AsyncWrite, 
        AsyncWriteExt
    };

    #[derive(Debug, Clone)]
    pub struct Response<S: AsyncRead + Unpin> {
        pub status: Status,
        pub headers: HashMap<String, String>,
        pub payload: S,
    }

    impl Response<io::Cursor<Vec<u8>>>{

        pub fn favicon_resp() -> Self{

            let mut favicon = fs::File::open("images/favicon.ico").unwrap();
            let mut bytes = Vec::new();
            let len = favicon.read_to_end(&mut bytes).unwrap();

            let headers = maplit::hashmap! {
                "Content-Type".to_owned() => "image/x-icon".to_owned(),
                "Content-Length".to_owned() => len.to_string(),
            };

            Self { 
                status: Status::Ok, 
                headers, 
                payload: io::Cursor::new(bytes), 
            }
        }

        pub fn err404Page() -> Self{

            let mut fBytes = Vec::new();
            let len = fs::File::read_to_end(&mut fs::File::open("html/404.html").unwrap(), &mut fBytes).unwrap();
            let status = Status::NotFound;

            let headers = maplit::hashmap! {
                "Content-Type".to_owned() => "text/html".to_owned(),
                "Content-Length".to_owned() => len.to_string(),
            };


            Self{
                status,
                headers,
                payload: io::Cursor::new(fBytes),
            }
        }
        
        pub fn err404() -> Self{
            Self { status: Status::NotFound, headers: HashMap::new(), payload: Cursor::new( Vec::new()) }
        }
    }

    impl<S: AsyncRead + Unpin> Response<S>{
        pub fn status_and_headers(&self) -> String {
            let headers = self.headers
                .iter()
                .map(|(k,v)| format!("{k}: {v}"))
                .collect::<Vec<_>>()
                .join("\r\n")
                ;
            format!("HTTP/1.1 {}\r\n{headers}\r\n\r\n", self.status)
        }

        pub async fn write<O: AsyncWrite + Unpin>(mut self, stream: &mut O) -> Result<(), anyhow::Error>{
            stream.write_all(self.status_and_headers().as_bytes()).await?;

            tokio::io::copy(&mut self.payload, stream).await?;

            Ok(())
        }
    }

    #[derive(PartialEq, Debug, Clone, Copy)]
    pub enum Status{
        NotFound,
        Ok,
    }

    impl std::fmt::Display for Status{
        fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
            match self {
                Self::NotFound => write!(f, "404 Not Found"),
                Self::Ok => write!(f, "200 Ok"),
            }
        }
    }

    #[derive(Debug)]
    pub enum ContentType{
        js,
        html,
        css,
        jpg,
        png,
        json, 
        webp,
        ico,
    }

    impl ToString for ContentType{

        fn to_string(&self) -> String {
            match self{
                ContentType::js => "text/javascript".to_owned(),
                ContentType::html => "text/html".to_owned(),
                ContentType::css => "text/css".to_owned(),
                ContentType::jpg => "image/jpg".to_owned(),
                ContentType::png => "image/png".to_owned(),
                ContentType::json => "application/json".to_owned(),
                ContentType::webp => "image/webp".to_owned(),
                ContentType::ico => "image/x-icon".to_owned(),
            }
        }
    }

    impl FromStr for ContentType{
        type Err = anyhow::Error;

        fn from_str(s: &str) -> Result<Self, Self::Err> {
            
            let pos = s.chars().count() - s.chars().rev().position(|c| c == '.').unwrap() - 1;
            let file_type = &s[pos..];

            match file_type {
                ".html" => Ok(ContentType::html),
                ".css" => Ok(ContentType::css),
                ".js" => Ok(ContentType::js),
                ".png" => Ok(ContentType::png),
                ".jpg" => Ok(ContentType::jpg),
                ".json" => Ok(ContentType::json),
                ".webp" => Ok(ContentType::webp),
                ".ico" => Ok(ContentType::ico),
                _ => Err(anyhow::anyhow!("Invalid file type: {}", file_type))
            }
        }
    }
}