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
                println!("Path: {:?}", request.path);

                //Write index.html to socket
                if method == Method::GET && (request.path.trim() == "/" || request.path.trim() == "/ index.html"){

                    let mut f = String::new(); 

                    fs::File::read_to_string(&mut fs::File::open("html/index.html").unwrap(), &mut f);
                    let resp = Response::from_html(
                        Status::Ok,
                        f,
                    );

                    resp.write(&mut stream).await.unwrap();

                }else if method == Method::GET && request.path == "/style.css"{
                    
                    let mut f = String::new();

                    fs::File::read_to_string(&mut fs::File::open("html/style.css").unwrap(), &mut f);
                    let resp = Response::from_html(Status::Ok, f);

                    resp.write(&mut stream).await.unwrap();
                }else {
                    eprintln!("404 Error");
                    let status_line = "HTTP/1.1 404 NOT FOUND";
                    let contents = fs::read_to_string("html/404.html").unwrap();
                    let length = contents.len();

                    let response = format!(
                        "{status_line}\r\nContent-Length: {length}\r\n\r\n{contents}"
                    );

                    println!("Response: {response}");

                    stream.write(response.as_bytes());
                }
            }
        });
                // handle_client(stream)?
            
    }
    
    Ok(())
}

async fn handle_connections(mut stream: TcpStream) {
    let mut buf: Vec<u8> = Vec::new();

    loop {
        let n: usize = match stream.read_buf(&mut buf).await{
            Ok(n) if n == 0 => { return},
            Ok(n) => n,
            Err(e) => {eprintln!("Failed to read bytes from socket. Err:{e}"); return},
        };
    }
    // let request = parse_request(stream);
    let req = String::from_utf8(buf.clone()).unwrap();
        eprintln!("Read bytes: {req}");

    // let http_request: Vec<_> = buf_reader.lines()
    //     .map(|result| result.unwrap())
    //     .take_while(|line| !line.is_empty())
    //     .collect();
    // let method = &http_request[0];
    // println!("method: {}", method);

    // if method.trim() == "GET /index.html HTTP/1.1" || method.trim() == "GET / HTTP/1.1"{
    //     let status_line = "HTTP/1.1 200 OK";
    //     let index = fs::read_to_string("html/index.html").expect("Failed to find index.html");
    //     let file_len = index.len();
    
    //     let response = format!("{status_line}\r\nContent-Length: {file_len}\r\n\r\n{index}");
    
    //     stream.write_all(response.as_bytes())?;

    // }else if method.trim() == "GET /style.css HTTP/1.1" {

    //     let status_line = "HTTP/1.1 200 OK";
    //     let css = fs::read_to_string("html/style.css").expect("Failed to find style.css");
    //     let file_len = css.len();
    
    //     let response = format!("{status_line}\r\nContent-Length: {file_len}\r\n\r\n{css}");
    
    //     stream.write_all(response.as_bytes())?;
    // }else {
    //     let status_line = "HTTP/1.1 404 NOT FOUND";
    //     let contents = fs::read_to_string("html/404.html").unwrap();
    //     let length = contents.len();

    //     let response = format!(
    //         "{status_line}\r\nContent-Length: {length}\r\n\r\n{contents}"
    //     );

    //     stream.write_all(response.as_bytes()).unwrap();
    // }



}

fn handle_client(stream: TcpStream) -> std::io::Result<()>{



    Ok(())
}

mod req{
    use std::collections::HashMap;
    use anyhow::anyhow;
    use tokio::io::{AsyncBufRead, AsyncBufReadExt};

    #[derive(Debug)]
    pub struct Request{
        pub method: Method,
        pub path: String,
        headers: HashMap<String, String>,
    }

    #[derive(PartialEq, Eq, Debug)]
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
        collections::HashMap,
        io,
    };

    use tokio::io::{
        AsyncRead, 
        AsyncWrite, 
        AsyncWriteExt
    };

    pub struct Response<S: AsyncRead + Unpin> {
        status: Status,
        headers: HashMap<String, String>,
        payload: S,
    }

    impl Response<io::Cursor<Vec<u8>>>{
        pub fn from_html(status: Status, data: impl ToString) -> Self{
            let bytes = data.to_string().into_bytes();

            let headers = maplit::hashmap! {
                "Content-Type".to_owned() => "text/html".to_owned(),
                "Content-Length".to_owned() => bytes.len().to_string(),
            };

            Self{
                status,
                headers,
                payload: io::Cursor::new(bytes),
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

    #[derive(PartialEq)]
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