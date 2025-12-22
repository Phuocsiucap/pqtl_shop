import { useEffect } from 'react';
import {BrowserRouter as Router, Routes, Route,useNavigate} from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { PublicPage, PrivatePage } from './page';
import { LoginUser } from './redux/Actions';
import ScrollToTop from './Component/StopScroll';
import ChatBot from './Component/ChatBot/ChatBot';

function App() {
  const dispatch=useDispatch();
  useEffect(() => {
    try {
      const storedUserStr = localStorage.getItem("user");
      if (storedUserStr) {
        const storedUser = JSON.parse(storedUserStr);
        if (storedUser) {
          dispatch(LoginUser(storedUser))
        }
      }
    } catch (error) {
      console.error("Lỗi khi parse user từ localStorage:", error);
    }
  }, [dispatch]);
  return (
    <Router>
      <div className='App'>
        <ScrollToTop />
        <ChatBot /> {/* Tích hợp Chatbot toàn trang */}
        <Routes>
        {

          PublicPage.map((page,index)=>{
            const Page=page.component
            const Layout=page.layout
            if(Layout==null) return (
              <Route key={index}  path={page.path} element={
                  <Page/>
              }
              />
            )
            else {
              return(
                <Route key={index}  path={page.path} element={
                  <Layout>
                    <Page/>
                  </Layout>
                }
                />
              )
            }
          })
        }
      </Routes>
      </div>
    </Router>
  );
}
export default App
