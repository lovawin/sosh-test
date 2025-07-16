import { SUPPORT_MAIL_ADDRESS } from "constants/appConstants";
import React from "react";
import { Main, Heading } from "./style";

function ProfileVerification() {
  return (
    <Main>
      <Heading>Apply for SOSH Verification Badge</Heading>
      <p>
        The SOSH Verification Badge is a blue checkmark icon that appears next
        to a username to indicate that the account represents a well-known
        creator, influencer, public figure, celebrity, or brand.
        <br /> <br />
        All verification badges are reviewed and approved by SOSH’s Management
        Team on a case-by-case basis in order to preserve the authenticity of
        our community and to promote confidence in the transactions made on our
        platform. <br /> <br />
        To apply for a verification badge, please send an email to
        <a
          target="_blank"
          rel="noreferrer"
          href={`mailto:${SUPPORT_MAIL_ADDRESS}`}
        >
          {" "}
          {SUPPORT_MAIL_ADDRESS}
        </a>{" "}
        with “Verification” in the subject line and include the following
        information: <br /> <br />
        <b>Eligibility Requirements: </b>
        <br />
        1.Your SOSH username <br />
        2.Your first and last name (or company name)
        <br />
        Please allow up to 60 days for us to review your application. We will
        notify you via email on the status of your request. Thank you for your
        patience!
      </p>
    </Main>
  );
}

export default ProfileVerification;
