import Footer from "./Footer";
import Header from "./Header";

function Defaultlayout({children }) {
    return ( 
        <div>
            <Header/>
            <div className="container">
                {
                    children 
                }
            </div>
            <Footer/>
        </div>

     );
}

export default Defaultlayout;