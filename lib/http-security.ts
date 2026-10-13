export const privateHeaders={"Cache-Control":"private, no-store, max-age=0","Pragma":"no-cache","X-Content-Type-Options":"nosniff","X-Robots-Tag":"noindex, nofollow, noarchive","Vary":"Cookie, oai-authenticated-user-id"};
export const jsonError=(error:string,status:number)=>Response.json({error},{status,headers:privateHeaders});
export function sameOrigin(request:Request){
 const origin=request.headers.get("origin");
 return !!origin && origin===new URL(request.url).origin && request.headers.get("sec-fetch-site")!=="cross-site";
}
export async function boundedJson(request:Request,maxBytes=16384):Promise<unknown>{
 if(!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) throw new Error("FORMAT");
 if(Number(request.headers.get("content-length")||0)>maxBytes)throw new Error("SIZE");
 const reader=request.body?.getReader();if(!reader)throw new Error("BODY");
 const chunks:Uint8Array[]=[];let size=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>maxBytes){await reader.cancel();throw new Error("SIZE");}chunks.push(value);}}finally{reader.releaseLock();}
 const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}
 return JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(bytes));
}
