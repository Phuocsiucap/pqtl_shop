import Laptop from "./Laptop";
import Ultrabook from "./Ultrabook";
import PhuKien from "./PhuKien";
import { useEffect, useState } from "react";
import { request1 } from "../../../utils/request";
import { isArray } from "chart.js/helpers";
function Content() {
  const [good, setGood] = useState([]);
  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await request1.get("goods/list");
        const data = response.data;
        setGood(data);
      } catch (e) {
        console.log("Có lỗi ", e);
      }
    };
    fetch();
  }, []);
  return (
    <div>
      <Laptop good={good} />
      <Ultrabook good={good} />
      <PhuKien good={good} />
    </div>
  );
}

export default Content;
