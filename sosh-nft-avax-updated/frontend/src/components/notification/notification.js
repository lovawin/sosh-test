import { Main, Row, Heading, Text, HeadDiv } from "./style";
import Checkbox from "../formComponents/checkbox";
import { useState } from "react";
function Notification() {
  const [data, setData] = useState({});

  const handleChech = (e) => {
    setData((prev) => {
      return { ...prev, [e.target.name]: e.target.value };
    });
  };

  return (
    <Main>
      <Heading>Notifications</Heading>
      <HeadDiv>
        {/* <Row>
          <Text>New Sale</Text>
          <Checkbox
            value={data}
            name="sale"
            onChange={handleChech}
            type="checkbox"
          />
        </Row>
        <hr /> */}

        <Row>
          {" "}
          <Text>Like on Post</Text>
          <Checkbox
            value={true}
            name="like"
            onChange={handleChech}
            type="checkbox"
          />
        </Row>

        <Row>
          {" "}
          <Text>Comment on Post</Text>
          <Checkbox
            value={true}
            name="comment"
            onChange={handleChech}
            type="checkbox"
          />
        </Row>
      </HeadDiv>
    </Main>
  );
}

export default Notification;
