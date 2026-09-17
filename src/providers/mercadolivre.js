const axios=require("axios");const {terms,normalize}=require("../util");
async function search(){
 const token=process.env.ML_ACCESS_TOKEN;if(!token)return [];
 let all=[];
 for(const q of terms()){
  try{
   const {data}=await axios.get("https://api.mercadolibre.com/sites/MLB/search",{params:{q,limit:20},headers:{Authorization:`Bearer ${token}`},timeout:15000});
   for(const r of (data.results||[])){
    const o=normalize({title:r.title,price:r.price,oldPrice:r.original_price||r.originalPrice,url:r.permalink,image:r.thumbnail,discount:r.original_price&&r.price?((r.original_price-r.price)/r.original_price*100):0},"Mercado Livre");
    if(o)all.push(o);
   }
  }catch(e){console.error("[Mercado Livre]",q,e.response?.status||"",e.message)}
 }
 return all;
}
module.exports={search};