const crypto=require("crypto");
const terms=()=>String(process.env.SEARCH_TERMS||"ssd nvme,placa de video,ryzen").split(",").map(x=>x.trim()).filter(Boolean);
const n=v=>{if(v==null||v==="")return null;if(typeof v==="number")return v;let s=String(v).replace(/[^\d,.-]/g,"");if(s.includes(",")&&!s.includes("."))s=s.replace(",",".");else if(s.includes(",")&&s.includes("."))s=s.replace(/\./g,"").replace(",",".");let x=Number(s);return Number.isFinite(x)?x:null};
function normalize(x,store){
 let price=n(x.price??x.currentPrice??x.sale_price??x.target_sale_price);
 let old=n(x.oldPrice??x.originalPrice??x.original_price??x.target_original_price);
 let discount=n(x.discount??x.discountPercent??x.discount_percent);
 if(!discount&&old&&price&&old>price)discount=(old-price)/old*100;
 let url=x.url??x.link??x.permalink??x.product_detail_url??x.promotion_link;
 let title=x.title??x.name??x.product_title;
 if(!title||!url||!price)return null;
 return {id:crypto.createHash("sha256").update(String(url)).digest("hex"),title:String(title),store:String(x.store||store||"Loja"),url:String(url),image:String(x.image??x.imageUrl??x.thumbnail??x.product_main_image_url??""),oldPrice:old,price,discount:Math.round(Number(discount||0)*100)/100,raw:x};
}
module.exports={terms,n,normalize};