const axios=require("axios");const {normalize}=require("../util");
async function search(){
 if(!process.env.CUSTOM_FEED_URL)return [];
 const headers={};if(process.env.CUSTOM_FEED_TOKEN)headers.Authorization=`Bearer ${process.env.CUSTOM_FEED_TOKEN}`;
 try{const {data}=await axios.get(process.env.CUSTOM_FEED_URL,{headers,timeout:20000});const a=Array.isArray(data)?data:(data.offers||data.results||[]);return a.map(x=>normalize(x,x.store||"Feed")).filter(Boolean)}
 catch(e){console.error("[Feed]",e.message);return []}
}
module.exports={search};