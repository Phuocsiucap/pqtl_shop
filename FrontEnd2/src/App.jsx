import { useEffect } from 'react';
import {BrowserRouter as Router, Routes, Route,useNavigate} from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { PublicPage, PrivatePage } from './page';
import { LoginUser } from './redux/Actions';
import ScrollToTop from './Component/StopScroll';
function App() {
  const dispatch=useDispatch();
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      dispatch(LoginUser(storedUser))
    }
  }, []);
  return (
    <Router>
      <div className='App'>
        <ScrollToTop/>
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
