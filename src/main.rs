/******************************************************************************
Welcome to GDB Online.
GDB online is an online compiler and debugger tool for C, C++, Python, Java, PHP, Ruby, Perl,
C#, OCaml, VB, Swift, Pascal, Fortran, Haskell, Objective-C, Assembly, HTML, CSS, JS, SQLite, Prolog.
Code, Compile, Run and Debug online from anywhere in world.

*******************************************************************************/
#![allow(warnings)]
use std::{
    fs::{self, File}, 
    io::{self, BufRead, BufReader, ErrorKind, Read, Write}, path::Display //net::{TcpListener, TcpStream}
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

                let request = parse_request(&mut stream).await.unwrap();
                let method = request.method;
                
                //Images
                if method == Method::GET && (request.path.trim() == "/" || request.path.trim() == "/index.html"){

                    println!("Index request");

                    // let mut f = String::new();

                    // fs::File::read_to_string(&mut fs::File::open("html/index.html").await.unwrap(), &mut f);

                    let mut index = fs::File::open("html/index.html").unwrap();
                    // println!("file lines: {}", index.lines().count());
                    let mut f: Vec<u8> = Vec::new();
                    index.read_to_end(&mut f);
                    // let f = String::from_utf8(f).unwrap();

                    // println!("Index file read: {f}");

                    let resp = Response::from_html(
                        Status::Ok,
                        f,
                    );

                    resp.write(&mut stream).await.unwrap();

                } else if method == Method::GET && request.path.trim() == "/portfolio.html"{


                    let mut portfolio = fs::File::open("html/portfolio.html").unwrap();
                    let mut bytes: Vec<u8> = Vec::new();
                    portfolio.read_to_end(&mut bytes);
                    let resp = Response::from_html(Status::Ok, bytes);

                    resp.write(&mut stream).await.unwrap();
                } else if method == Method::GET && request.path.trim() == "/css/style.css"{

                    
                    println!("CSS request");

                    // let mut f = String::new();

                    // fs::File::read_to_string(&mut fs::File::open("html/index.html").await.unwrap(), &mut f);

                    let mut index = fs::File::open("css/style.css").unwrap();
                    // println!("file lines: {}", index.lines().count());
                    let mut f: Vec<u8> = Vec::new();
                    index.read_to_end(&mut f);
                    // let f = String::from_utf8(f).unwrap();

                    // println!("Index file read: {f}");

                    let resp = Response::from_css(
                        Status::Ok,
                        f,
                    );

                    resp.write(&mut stream).await.unwrap();

                }else if method == Method::GET && request.path.trim() == "/images/indexBackground.jpg" {
                    eprintln!("Background img request");

                    let mut index = fs::File::open("images/indexBackground.jpg").unwrap();
                    // println!("file lines: {}", index.lines().count());
                    let mut f: Vec<u8> = Vec::new();
                    index.read_to_end(&mut f);
                    // eprintln!("img read");
                    // let f = String::from_utf8(f).unwrap();

                    // println!("Index file read: {f}");

                    let resp = Response::from_jpg(
                        Status::Ok,
                        f,
                    );

                    resp.write(&mut stream).await.unwrap();
                // }else if method == Method::GET && request.path.trim() == "/portfolio.html"{

                //     let mut portfolio = fs::File::open("html/portfolio.html").unwrap();
                //     let mut bytes: Vec<u8> = Vec::new();
                //     portfolio.read_to_end(&mut bytes);
                //     let resp = Response::from_html(Status::Ok, bytes);

                //     resp.write(&mut stream).await.unwrap();

                }else {
                    eprintln!("404 error");
                    eprintln!("req: {request:?}");
                    let response = Response::err404();
                    // eprintln!("404 response received");

                    response.write(&mut stream).await.unwrap();

                    // println!("Response: {:?}", String::from_utf8(response.payload.into_inner()).unwrap());
                }
            }
        });
                // handle_client(stream)?
            
    }
    
    Ok(())
}

async fn send_index(stream: &mut BufStream<TcpStream>){
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
            .ok_or(anyhow::anyhow!("missing method"))
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
        fs::{self},
        collections::HashMap,
        io::{self, Bytes, Cursor, Read},
    };

    use tokio::io::{
        AsyncRead, 
        AsyncWrite, 
        AsyncWriteExt
    };

    #[derive(Debug, Clone)]
    pub struct Response<S: AsyncRead + Unpin> {
        status: Status,
        headers: HashMap<String, String>,
        payload: S,
    }

    impl Response<io::Cursor<Vec<u8>>>{
        pub fn from_html(status: Status, data: Vec<u8>) -> Self{

            let headers = maplit::hashmap! {
                "Content-Type".to_owned() => "text/html".to_owned(),
                "Content-Length".to_owned() => data.len().to_string(),
            };

            Self{
                status,
                headers,
                payload: io::Cursor::new(data),
            }
        }
        
        pub fn from_css(status: Status, data: Vec<u8>) -> Self{

            let headers = maplit::hashmap! {
                "Content-Type".to_owned() => "text/css".to_owned(),
                "Content-Length".to_owned() => data.len().to_string(),
            };

            Self{
                status,
                headers,
                payload: io::Cursor::new(data),
            }
        }

        pub fn from_jpg(status: Status, data: Vec<u8>) -> Self{

            let headers = maplit::hashmap! {
                "Content-Type".to_owned() => "image/jpg".to_owned(),
                "Content-Length".to_owned() => data.len().to_string(),
            };

            Self{
                status,
                headers,
                payload: io::Cursor::new(data),
            }
        }

        pub fn err404() -> Self{

            let mut fBytes = Vec::new();
            let len = fs::File::read_to_end(&mut fs::File::open("html/404.html").unwrap(), &mut fBytes).unwrap();
            let status = Status::NotFound;

            let headers = maplit::hashmap! {
                "Content-Type".to_owned() => "text/html".to_owned(),
                "Content-Length".to_owned() => len.to_string(),
            };

            // println!("404 file: {}", String::from_utf8(fBytes.clone()).unwrap());


            Self{
                status,
                headers,
                payload: io::Cursor::new(fBytes),
            }
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
}