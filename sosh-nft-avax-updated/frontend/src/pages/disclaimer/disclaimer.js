import SectionWrapper from "components/sectionWrapper";
import { StyledDisclaimerWrapper } from "./style";

function DisclamerPage() {
  return (
    <SectionWrapper>
      <StyledDisclaimerWrapper>
        <h1 className="page-heading">DISCLAIMER</h1>

        <p className="body-text">Last updated March 15, 2022</p>

        <h3 className="page-sub-heading">WEBSITE DISCLAIMER </h3>

        <p className="body-text">
          The Information provided by Sosh, Inc. ("we", "us" or "our") on
          soshnft.io (the "Site") is for general informational purposes only.
          All information on this site is provided in good faith, however we
          make no representation or warranty of any kind, express or implied,
          regarding the accuracy, adequacy, validity, reliability, availability
          or completeness of any information on the Site. UNDER NO CIRCUMSTANCE
          SHALL WE HAVE ANY LIABILITY TO YOU FOR ANY LOSS OR DAMAGE OF ANY KIND
          INCURRED AS A RESULT OF THE USE OF THE SITE OR RELIANCE ON ANY
          INFORMATION PROVIDED ON THE SITE. YOUR USE OF THE SITE AND YOUR
          RELIANCE ON ANY INFORMATION ON THE SITE IS SOLELY AT YOUR OWN RISK.
        </p>
        <h3 className="page-sub-heading"> EXTERNAL LINKS DISCLAIMER </h3>
        <p className="body-text">
          The Site may contain (or you may be sent through the Site) links to
          other websites or content belonging to or originating from third
          parties or links to websites and features in banners or other
          advertising. Such external links are not investigated, monitored, or
          checked for accuracy, adequacy, validity, reliability, availability or
          completeness by us. WE DO NOT WARRANT, ENDORSE, GUARANTEE, OR ASSUME
          RESPONSIBILITY FOR THE ACCURACY OR RELIABILITY OF ANY INFORMATION
          OFFERED BY THIRD- PARTY WEBSITES LINKED THROUGH THE SITE OR ANY
          WEBSITE OR FEATURE LINKED IN ANY BANNER OR OTHER ADVERTISING. WE WILL
          NOT BE A PARTY TO OR IN ANY WAY BE RESPONSIBLE FOR MONITORING ANY
          TRANSACTION BETWEEN YOU AND THIRD-PARTY PROVIDERS OF PRODUCTS OR
          SERVICES.
        </p>
      </StyledDisclaimerWrapper>
    </SectionWrapper>
  );
}

export default DisclamerPage;
