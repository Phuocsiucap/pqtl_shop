const PricetoString=(price)=>{
    if(price!==null){
        let temp=price.toString().split('');
    
        for(let i=temp.length-3;i>0;i-=3){
            temp.splice(i,0,".");
        }
        return temp.join('');
    }
    else return null;
   
}
export {PricetoString};