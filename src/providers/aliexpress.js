const axios=require("axios"),crypto=require("crypto");const {terms,normalize}=require("../util");
function sign(params,secret){const s=secret+Object.keys(params).sort().map(k=>k+params[k]).join("")+secret;return crypto.createHash("md5").update(s).digest("hex").toUpperCase()}
async function search(){
 const key=process.env.ALIEXPRESS_APP_KEY,secret=process.env.ALIEXPRESS_APP_SECRET,tracking=process.env.ALIEXPRESS_TRACKING_ID;
 if(!key||!secret||!tracking)return [];
 let all=[];
 for(const q of terms()){
  const p={method:"aliexpress.affiliate.product.query",app_key:key,timestamp:Date.now(),format:"json",sign_method:"md5",keywords:q,page_no:1,page_size:20,target_currency:"BRL",target_language:"PT",tracking_id:tracking};
  p.sign=sign(p,secret);
  try{
   const {data}=await axios.get(process.env.ALIEXPRESS_API_URL||"https://api-sg.aliexpress.com/sync",{params:p,timeout:20000});
   const root=data.aliexpress_affiliate_product_query_response?.resp_result?.result||{};
   const arr=root.products?.product||[];
   for(const r of arr){
    const o=normalize({product_title:r.product_title,target_sale_price:r.target_sale_price,target_original_price:r.target_original_price,discount_percent:r.discount,product_detail_url:r.promotion_link||r.product_detail_url,product_main_image_url:r.product_main_image_url},"AliExpress");
    if(o)all.push(o);
   }
  }catch(e){console.error("[AliExpress]",q,e.response?.status||"",e.message)}
 }
 return all;
}
module.exports={search};