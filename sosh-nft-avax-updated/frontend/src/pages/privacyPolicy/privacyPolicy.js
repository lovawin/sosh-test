import SectionWrapper from "components/sectionWrapper";
import { SUPPORT_MAIL_ADDRESS } from "constants/appConstants";
import { StyledPrivacyWrapper } from "./style";
import { Viewer, Worker } from "@react-pdf-viewer/core";

function PrivacyPolicy() {
  return (
    <SectionWrapper>
      <StyledPrivacyWrapper>
        <h1 className="page-heading">Sosh, Inc. (“Sosh”) Privacy Policy</h1>
        <p className="body-text">
          This Privacy Policy (“Policy”) describes how Sosh collects, uses and
          discloses information, and what choices you have with respect to the
          information. This Policy applies to the Soshnft.io (the “Site”) and
          services (collectively, the “Services”). When we refer to “Sosh”, we
          mean the Sosh, Inc. entity that acts as the controller of your
          information. By using the Services, you accept the terms of this
          Policy and our Terms of Service, and consent to our initial
          collection, use, disclosure, and retention of your information as
          described in this Policy and Terms of Service. Please note that this
          Policy does not apply to information collected through third-party
          websites or services that you may access through the Services or that
          you submit to us through email, text message or other electronic
          message or offline. If you are visiting this site from the European
          Union (EU), see our Notice to EU Data Subjects below for our legal
          bases for processing and transfer of your data.
        </p>

        <h3 className="page-sub-heading">1. What We Collect </h3>
        <p className="body-text">
          We get information about you in a range of ways.
        </p>

        <ol className="order-list type-a" type="a">
          <li className="body-text">
            <span>
              Information You Give Us. We collect and store information about
              you when you directly provide it to us. This happens when you:
            </span>

            <ol className="order-list type-i" type="i">
              <li className="body-text">
                register or create an account (e.g., your email address);
              </li>
              <li className="body-text">
                request assistance from our customer support team;
              </li>
              <li className="body-text">
                complete contact forms, request newsletters or other
                information, or participate in contests and surveys;
              </li>
              <li className="body-text">
                make public contributions to the Service (e.g., when you
                interact with third parties through the Service or post a
                comment); or
              </li>
              <li className="body-text">
                otherwise participate in activities we promote that require
                information about you.
              </li>
              <li className="body-text">
                information related to NFT transactions, such as cryptocurrency
                wallet addresses, transaction history, and user preferences;
              </li>
              <li className="body-text">
                receive your social media accounts; and
              </li>
              <li className="body-text">payment methods.</li>
            </ol>
          </li>
          <li className="body-text">
            <span>
              Information Automatically Collected. We may automatically record
              certain information (“Log Data”) when you use and interact with
              our Site. Log data may include:
            </span>

            <ol className="order-list type-i" type="i">
              <li className="body-text">
                your general activity on the Site (e.g., your viewing history
                and search activity, including the date and time the Site was
                used);
              </li>
              <li className="body-text">
                identifiers such as session identifiers;
              </li>
              <li className="body-text"> your geographic location;</li>
              <li className="body-text">
                website traffic volume, frequency of visits, and type and time
                of transactions you initiate through the site;
              </li>
              <li className="body-text">
                information regarding your interacting with email messages
                (e.g., whether you opened, clicked on, or forwarded an email
                message);
              </li>
              <li className="body-text">
                your Internet Protocol (IP) address;
              </li>
              <li className="body-text">
                the type and settings of the device, operating system, and
                browser used to access the Site; and
              </li>
              <li className="body-text">
                other information gathered through cookies and similar
                technologies, which are discussed further in the section of this
                Privacy Policy entitled “Cookies”.
              </li>
            </ol>
          </li>

          <li className="body-text">
            Information We Will Never Collect. We will never ask you to share
            your private keys or wallet seed. Never trust anyone or any site
            that asks you to enter your private keys or wallet seed.
          </li>
          <li className="body-text">
            <span>
              Email Marketing. We offer electronic newsletters to which you may
              voluntarily subscribe at any time. We are committed to keeping
              your e-mail address confidential and will not disclose your email
              address to any third parties except as allowed in the information
              use and processing section or for the purposes of utilizing a
              third-party provider to send such emails. We will maintain the
              information sent via e-mail in accordance with applicable laws and
              regulations. In compliance with the CAN-SPAM Act, all e-mails sent
              from us will clearly state who the e-mail is from and provide
              clear information on contacting the sender. You may choose to stop
              receiving our newsletter or marketing emails by following the
              unsubscribe instructions included in these emails or by contacting
              us. However, you will continue to receive essential transactional
              emails.
            </span>
          </li>
          <li className="body-text">
            <span>
              Payments. We may provide paid products and/or services within the
              Site, including platforms used for NFT transactions, such as
              blockchain networks or digital wallet providers. In that case, we
              use third-party services for payment processing (e.g., payment
              processors). We will not store or collect your payment card
              details. That information is provided directly to our third-party
              payment processors whose use of your personal information is
              governed by their Privacy Policy. These payment processors adhere
              to the standards set by PCI-DSS as managed by the PCI Security
              Standards Council, which is a joint effort of brands like Visa,
              Mastercard, American Express and Discover. PCI-DSS requirements
              help ensure the secure handling of payment information.
            </span>
          </li>
        </ol>

        <h3 className="page-sub-heading">2. Use of Personal Information </h3>
        <p className="body-text">
          To provide our Service we will use your personal information in the
          following ways:
        </p>
        <ol className=" order-list type-i" type="i">
          <li className="body-text">
            {" "}
            to operate, maintain, and optimize the Services, the Site and your
            account;
          </li>
          <li className="body-text">
            {" "}
            to improve the quality and types of services that we deliver;
          </li>
          <li className="body-text"> to provide you with technical support;</li>
          <li className="body-text">
            {" "}
            to notify you of technical updates or changes in policy;
          </li>
          <li className="body-text">
            {" "}
            to process transactions that you have conducted through the Site;
          </li>
          <li className="body-text">
            {" "}
            to collect aggregate statistics about your use of the Services, the
            Site and your account;
          </li>
          <li className="body-text">
            {" "}
            to comply with applicable laws, lawful requests and legal process,
            such as to respond to subpoenas or requests from government
            authorities; and
          </li>
          <li className="body-text">
            {" "}
            to protect, investigate, and deter against fraudulent, unauthorized,
            or illegal activity.
          </li>
          <li className="body-text">
            {" "}
            to improve Algorithmic purposes and quality improvement (e.g.
            additional features and functionalities).
          </li>
        </ol>

        <h3 className="page-sub-heading">3. Cookies</h3>
        <ol className="order-list type-a" type="a">
          <li className="body-text">
            {" "}
            Cookies are required for this Site to function properly. Cookies are
            small text files that are places on your computer by websites that
            you visit. These text files can be read by these websites and help
            to identify you when you return to a website. Cookies can be
            “persistent” or “session” cookies. Persistent cookies remain on your
            computer when you have gone offline, while session cookies are
            deleted as soon as you close your web browser. To find out more
            about cookies, including how to see what cookies have been set and
            how to block and delete cookies, please visit{" "}
            <a
              href="http://www.aboutcookies.org/"
              target="_blank"
              rel="noreferrer"
            >
              http://www.aboutcookies.org/
            </a>
            .
          </li>
          <li className="body-text">
            We use cookies and similar technologies (such as action tags, also
            known as beacons, or pixels tags) for a number of purposes,
            including to remember preferences, track conversions, conduct
            marketing and promotional efforts, analyze site traffic and trends,
            and generally understand the online behaviors and interests of
            people who interact with our Site.
          </li>
          <li className="body-text">
            We use third-party analytics service providers to assist us in
            collecting and understanding website usage information. We use
            information from these services to help us improve our website and
            the services we provide to our users.
          </li>
          <li className="body-text">
            By using the Site, you agree to our use of these tracking
            technologies.
          </li>
        </ol>

        <h3 className="page-sub-heading">4. How to Disable Cookies</h3>
        <ol className="order-list type-a" type="a">
          <li className="body-text">
            <span>
              You can generally activate or later deactivate the use of cookies
              through a functionality built into your web browser. To learn more
              about how to control cookie settings through your browser:
            </span>

            <ol className="order-list type-i" type="i">
              <li className="body-text">
                {" "}
                Click here to learn more about the “Private Browsing” setting
                and managing cookie settings in Firefox;{" "}
              </li>
              <li className="body-text">
                {" "}
                Click here to learn more about “Incognito” and managing cookie
                settings in Chrome;
              </li>
              <li className="body-text">
                {" "}
                Click here to learn more about “InPrivate” and managing cookie
                settings in Internet Explorer; or{" "}
              </li>
              <li className="body-text">
                {" "}
                Click here to learn more about “Private Browsing” and managing
                cookie settings in
              </li>
              Safari.
            </ol>
          </li>

          <li className="body-text">
            If you want to learn more about cookies, or how to control, disable
            or delete them, please visit{" "}
            <a
              href="http://www.aboutcookies.org/"
              target="_blank"
              rel="noreferrer"
            >
              http://www.aboutcookies.org/
            </a>{" "}
            for detailed guidance. In addition, certain third party advertising
            networks, including Google, permit users to opt out of or customize
            preferences associated with your internet browsing.
          </li>

          <li className="body-text">
            We may link the information collected by Cookies with other
            information we collect from you pursuant to this Privacy Policy and
            use the combined information as set forth herein. Similarly, the
            third parties who serve cookies on our Site may link your name or
            email address to other information they collect, which may include
            past purchases made offline or online, or your online usage
            information. If you are located in the European Economic Area, you
            have certain rights that are described above under the header
            “Notice to EU Data Subjects”, including the right to inspect and
            correct or delete the data that we have about you.
          </li>
        </ol>

        <h3 className="page-sub-heading">5. Sharing of Personal Information</h3>
        <p className="body-text">
          We do not share or sell the personal information that you provide us
          with other organizations without your express consent, except as
          described in this Privacy Policy. We disclose personal information to
          third parties under the following circumstances:
        </p>

        <ol className="order-list type-a" type="a">
          <li className="body-text">
            Affiliates. We may disclose your personal information to our
            subsidiaries and corporate affiliates for purposes consistent with
            this Privacy Policy.
          </li>

          <li className="body-text">
            Business Transfers. We may share personal information when we do a
            business deal, or negotiate a business deal, involving the sale or
            transfer of all or a part of our business or assets. These deals can
            include any merger, financing, acquisition, or bankruptcy
            transaction or proceeding.
          </li>

          <li className="body-text">
            <span>
              {" "}
              Compliance with Laws and Law Enforcement; Protection and Safety.
            </span>

            <ol className="order-list type-i" type="i">
              <li className="body-text">
                We may share personal information for legal, protection, and
                safety purposes.
              </li>
              <li className="body-text">
                We may share information to comply with laws.
              </li>
              <li className="body-text">
                We may share information to respond to lawful requests and legal
                processes.
              </li>
            </ol>
          </li>

          <li className="body-text">
            Professional Advisors and Service Providers. We may share
            information with those who need it to do work for us. These
            recipients may include third party companies and individuals to
            administer and provide the Service on our behalf (such as customer
            support, hosting, email delivery and database management services),
            as well as lawyers, bankers, auditors, and insurers.
          </li>

          <li className="body-text">
            Other. You may permit us to share your personal information with
            other companies or entities of your choosing. Those uses will be
            subject to the privacy policies of the recipient entity or entities.
          </li>

          <li className="body-text">
            <span>
              We may also share information about you in the following contexts:
            </span>

            <ol className="order-list type-i" type="i">
              <li className="body-text">
                <span>
                  Pursuant to an investigation. We may investigate and disclose
                  information from or about you if we have a good faith belief
                  that such investigation or disclosure
                </span>

                <ol className="order-list type-a" type="a">
                  <li className="body-text">
                    is reasonably necessary to comply with legal process and law
                    enforcement instructions and orders, such as a search
                    warrant, subpoena, statute, judicial proceeding, or other
                    legal process served on us;
                  </li>
                  <li className="body-text">
                    is helpful to prevent, investigate, or identify possible
                    wrongdoing in connection with the Site; or
                  </li>

                  <li className="body-text">
                    protects our rights, reputation, property, or that of our
                    users, affiliates, or the public.
                  </li>
                </ol>
              </li>

              <li className="body-text">
                As Anonymized Data. We frequently aggregate or de-identify
                personal data in a way that makes it impracticable to use that
                data to identify a particular person; we also sometimes maintain
                individual data records with personal identifiers removed. In
                this Privacy Policy, we refer to such data as “Anonymized Data”
                and do not consider it to be personal data. We may use
                Anonymized Data in order to create statistical information
                regarding the Services, the Site and its use, which we may then
                share with third parties. Though it is impracticable for third
                parties to use Anonymized Data to identify a particular person,
                it is possible. Further, we have explained in other sections of
                this Privacy Policy that in combination with supplemental data
                taken from other sources, third parties may be able to
                reidentify you. By using the Site, you understand and
                acknowledge this risk.
              </li>

              <li className="body-text">
                International Transfer. The Company has offices outside of the
                EU and has affiliates and service providers in the United States
                and in other countries. Your personal information may be
                transferred to or from the United States or other locations
                outside of your state, province, country or other governmental
                jurisdiction where privacy laws may not be as protective as
                those in your jurisdiction. EU users should read the important
                information provided below about transfer of personal
                information outside of the European Economic Area (EEA).
              </li>
            </ol>
          </li>
        </ol>

        <h3 className="page-sub-heading">
          6. Social Media Features and Widgets.
        </h3>

        <p className="body-text">
          Our Site may integrate with social sharing features or other related
          tools which let you share actions you take on our Site with other
          apps, sites or media, and vice versa. These features may enable the
          sharing of information with your friends or the public, depending on
          the settings you establish with the social sharing site. These
          features may also collect your IP address and which page you are
          visiting on our Site, and may set a cookie to enable the feature to
          function properly. Your interaction with these features are governed
          by the privacy policy of the relevant social sharing site. Please
          refer to the privacy policies of those social sharing sites for more
          information. As stated below, we cannot control Site visitors&#39; and
          users&#39; use of any such information or content you choose to make
          available publicly.
        </p>
        <h3 className="page-sub-heading"> X. Links to Other Sites</h3>
        <p className="body-text">
          Our Site may contain links to other sites that are not operated by us.
          If you click on a third-party link, you will be directed to that third
          party’s site. We strongly advise you to review the Privacy Policy of
          every site you visit. We have no control over and assume no
          responsibility for the content, privacy policies or practices of any
          third-party sites or services.
        </p>

        <h3 className="page-sub-heading">7. “Do Not Track” Signals</h3>
        <p className="body-text">
          Please note that your browser settings may allow you to automatically
          transmit a “Do Not Track” signal to websites and online services you
          visit. The Site does not alter its practices when it receives a “Do
          Not Track” from a visitor’s browser.
        </p>

        <h3 className="page-sub-heading">8. How Information is Secured</h3>
        <ol className="order-list type-a" type="a">
          <li className="body-text">
            We retain information we collect as long as it is necessary and
            relevant to fulfill the purposes outlined in this privacy policy. In
            addition, we retain personal information to comply with applicable
            law where required, prevent fraud, resolve disputes, troubleshoot
            problems, assist with any investigation, enforce our Terms of
            Service, and other actions permitted by law. To determine the
            appropriate retention period for personal information, we consider
            the amount, nature, and sensitivity of the personal information, the
            potential risk of harm from unauthorized use or disclosure of your
            personal information, the purposes for which we process your
            personal information and whether we can achieve those purposes
            through other means, and the applicable legal requirements.
          </li>

          <li className="body-text">
            In some circumstances we may anonymize your personal information (so
            that it can no longer be associated with you) in which case we may
            use this information indefinitely without further notice to you.
          </li>

          <li className="body-text">
            We employ industry standard security measures designed to protect
            the security of all information submitted through the Services.
            However, the security of information transmitted through the
            internet can never be guaranteed. We are not responsible for any
            interception or interruption of any communications through the
            internet or for changes to or losses of data. Users of the Services
            are responsible for maintaining the security of any password, user
            ID or other form of authentication involved in obtaining access to
            password protected or secure areas of any of our digital services.
          </li>
        </ol>

        <h3 className="page-sub-heading">9. Information Choices and Changes</h3>
        <ol className="order-list type-a" type="a">
          <li className="body-text">
            <span>
              Accessing, Updating, Correcting, and Deleting your Information:
            </span>

            <ol className="order-list type-i" type="i">
              <li className="body-text">
                You may access information that you have voluntarily provided
                through your account on the Services, and to review, correct, or
                delete it by sending a request to{" "}
                <a
                  href={`mailto:${SUPPORT_MAIL_ADDRESS}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  {SUPPORT_MAIL_ADDRESS}
                </a>
                . You can request to change contact choices, opt-out of our
                sharing with others, and update your personal information and
                preferences. We may require that you are the you are the user
                who you say you are by proving that you have control of your
                posting key via our conveyor API.  For more information about
                our conveyor API please see here.
              </li>

              <li className="body-text">
                Please note that other users may be able to identify you, or
                associate you with your account, if you include personal data in
                the content you post publicly. We are not responsible for, and
                this Privacy Policy does not apply to, information you choose to
                post publicly.
              </li>

              <li className="body-text">
                Please note that we have the right to reject deletion requests
                that are inconsistent with our Terms of Use, are unduly
                burdensome or repetitive or that cannot be honored in light of
                legal obligations or ongoing disputes, or where retention is
                necessary to enforce our agreements or protect our or another
                party’s rights, property, safety, or security. For example, we
                may retain information to prevent, investigate, or identify
                possible wrongdoing in connection with the Site or to comply
                with legal obligations. The time-period for which we keep
                information varies according to the information’s use. In some
                cases, there are legal requirements to keep data for a minimum
                period. Unless there is a specific legal requirement for us to
                keep the information, we plan to retain it for no longer than is
                necessary to fulfill a legitimate business need. Please also
                note that even after you have deleted your account, other
                content associated with your use of the Site may still be
                accessible and viewable in accordance with applicable law and
                our Terms of Use.
              </li>
            </ol>
          </li>
          <li className="body-text">
            We may retain Anonymized Data after you delete your account for
            analytics purposes.
          </li>
        </ol>

        <h3 className="page-sub-heading">10. Contact Information</h3>
        <p className="body-text">
          We welcome your comments or questions about this Policy, and you may
          contact us at:{" "}
          <a
            href={`mailto:${SUPPORT_MAIL_ADDRESS}`}
            rel="noreferrer"
            target="_blank"
          >
            {SUPPORT_MAIL_ADDRESS}
          </a>
          .
        </p>

        <h3 className="page-sub-heading">11. Eligibility</h3>

        <p className="body-text">
          If you are under the age of majority in your jurisdiction of
          residence, you may use the Services only with the consent of or under
          the supervision of your parent or legal guardian. The Site is not
          directed to children under 18 and children under 18 are not permitted
          to use the Site. We do not knowingly collect personal data from
          children under 18. If you become aware that a child has provided us
          with personal data without parental consent, please contact us (see
          “Contact Information”). If we become aware that a child under 18 has
          provided us with personal data without parental consent, we take steps
          to remove such information and terminate the applicable account.
          <br />
          <br />
          *California residents under 16 years of age may have additional rights
          regarding collecting their personal information. Please see
          https://oag.ca.gov/privacy/ccpa for more information.
        </p>

        <h3 className="page-sub-heading">12. Notice to California Residents</h3>
        <p className="body-text">
          We do not support Do Not Track (“DNT”). Do Not Track is a preference
          you can set in your web browser to inform websites that you do not
          want to be tracked. You can enable or disable Do Not Track by visiting
          your web browser's Preferences or Settings page. In addition to the
          rights, as explained in this Policy, California residents who provide
          Personal Information (as defined in the statute) to obtain products or
          services for personal, family, or household use are entitled to
          request and obtain from us, once a calendar year, information about
          the Personal Information we shared, if any, with other businesses for
          marketing uses. If applicable, this information would include the
          categories of Personal Information and the names and addresses of
          those businesses with which we shared such personal information for
          the immediately prior calendar year (e.g., requests made in the
          current year will receive information about the prior year). To obtain
          this information, please contact us.
          <br />
          <br />
          California law may provide you with additional rights regarding our
          use of your personal information if you are a California resident. To
          learn more about your California privacy rights, visit
          https://oag.ca.gov/privacy/ccpa.
          <br />
          <br />
          Under California Civil Code Section 1789.3, California users are
          entitled to the following consumer rights notice: California residents
          may reach the Complaint Assistance Unit of the Division of Consumer
          Services of the California Department of Consumer Affairs by mail at
          1625 North Market Blvd., Sacramento, CA 95834, or by telephone at
          (916) 445-1254 or (800) 952-5210.
        </p>

        <h3 className="page-sub-heading">13. Notice to EU Data Subjects</h3>
        <ol className="order-list type-a" type="a">
          <li className="body-text">
            Personal Information. With respect to EU data subjects, “personal
            information,” as used in this Privacy Policy, is equivalent to
            “personal data” as defined in the European Union General Data
            Protection Regulation (GDPR).
          </li>

          <li className="body-text">
            Legal Bases for Processing. We only use your personal information as
            permitted by law. We act as the controller of information that we
            ask you to provide to register your email address/create an account
            and information that we automatically collect when you use the Site.
            We act as the processor of user-generated content and information
            provided to us by third parties or other websites. We are required
            to inform you of the legal bases of our controlling and processing
            of your personal information, which are described in the bullet
            points below. If you have questions about the legal bases under
            which we process and control your personal information, contact us
            at{" "}
            <a
              href={`mailto:${SUPPORT_MAIL_ADDRESS}`}
              rel="noreferrer"
              target="_blank"
            >
              {SUPPORT_MAIL_ADDRESS}
            </a>
            .
          </li>

          <li className="body-text">
            Controlling and Processing Purposes.
            <ol className="order-list type-i" type="i">
              <li className="body-text"> Legal Basis</li>
              <li className="body-text">
                {" "}
                For compliance, fraud prevention, and safety
              </li>
              <li className="body-text"> To provide our Service</li>
            </ol>
            <p className="body-text">
              These activities constitute our legitimate interests. We make sure
              we consider and balance any potential impacts on you (both
              positive and negative) and your rights before we process your
              personal information for our legitimate interests. We do not use
              your personal information for activities where our interests are
              overridden by any adverse impact on you (unless we have your
              consent or are otherwise required or permitted to by law).
            </p>
          </li>

          <li className="body-text">
            With your consent. Where our use of your personal information is
            based upon your consent, you have the right to withdraw it anytime
            in the manner indicated in the Service or by contacting us at
            <a
              href={`mailto:${SUPPORT_MAIL_ADDRESS}`}
              rel="noreferrer"
              target="_blank"
            >
              {SUPPORT_MAIL_ADDRESS}
            </a>
            .
          </li>
          <li className="body-text">
            Use for New Purposes. We may use your personal information for
            reasons not described in this Privacy Policy, where we are permitted
            by law to do so and where the reason is compatible with the purpose
            for which we collected it. If we need to use your personal
            information for an unrelated purpose, we will notify you and explain
            the applicable legal basis for that use. If we have relied upon your
            consent for a particular use of your personal information, we will
            seek your consent for any unrelated purpose.
          </li>

          <li className="body-text">
            <span>
              Your Rights. Under the GDPR, you have certain rights regarding
              your personal information. You may ask us to take the following
              actions in relation to your personal information that we hold:
            </span>
            <ol className="order-list type-i" type="i">
              <li className="body-text">
                Opt-out. Stop sending you direct marketing communications which
                you have previously consented to receive. We may continue to
                send you Service-related and other non-marketing communications.
              </li>

              <li className="body-text">
                Access. Provide you with information about our processing of
                your personal information and give you access to your personal
                information.
              </li>

              <li className="body-text">
                Correct. Update or correct inaccuracies in your personal
                information.
              </li>

              <li className="body-text">
                Delete. Delete your personal information.
              </li>

              <li className="body-text">
                Transfer. Transfer a machine-readable copy of your personal
                information to you or a third party of your choice.
              </li>

              <li className="body-text">
                Restrict. Restrict the processing of your personal information.
              </li>

              <li className="body-text">
                Object. Object to our reliance on our legitimate interests as
                the basis of our processing of your personal information that
                impacts your rights.
              </li>
            </ol>
            <p className="body-text">
              You can submit these requests by email to{" "}
              <a
                href={`mailto:${SUPPORT_MAIL_ADDRESS}`}
                rel="noreferrer"
                target="_blank"
              >
                {SUPPORT_MAIL_ADDRESS}
              </a>
              . We may request specific information from you to help us confirm
              your identity and process your request. Applicable law may require
              or permit us to decline your request. If we decline your request,
              we will tell you why, subject to legal restrictions. If you would
              like to submit a complaint about our use of your personal
              information or response to your requests regarding your personal
              information, you may contact us at{" "}
              <a
                href={`mailto:${SUPPORT_MAIL_ADDRESS}`}
                rel="noreferrer"
                target="_blank"
              >
                {SUPPORT_MAIL_ADDRESS}
              </a>{" "}
              or submit a complaint to the data protection regulator in your
              jurisdiction. You can find your data protection regulator here.
            </p>
          </li>
        </ol>

        <h3 className="page-sub-heading">14. Cross-Border Data Transfer</h3>
        <p className="body-text">
          Please be aware that your personal data will be transferred to,
          processed, and stored in the United States. Data protection laws in
          the U.S. may be different from those in your country of residence. You
          consent to the transfer of your information, including personal
          information, to the U.S. as set forth in this Privacy Policy by
          visiting our site or using our Service.
        </p>
        <p className="body-text">
          Whenever we transfer your personal information out of the EEA to the
          U.S. or countries not deemed by the European Commission to provide an
          adequate level of personal information protection, the transfer will
          be based on a data transfer mechanism recognized by the European
          Commission as providing adequate protection for personal information.{" "}
        </p>
        <p className="body-text">
          Please contact us if you want further information on the specific
          mechanism used by us when transferring your personal information out
          of the EEA.
        </p>

        <h3 className="page-sub-heading">
          15. Modifications to this Privacy Policy.
        </h3>
        <p className="body-text">
          We may occasionally update this Privacy Policy. You can see when it
          was last updated by looking at the effective date at the bottom of
          this page. If we make any significant changes we&#39;ll post them
          prominently on our website and notify you by other means as required
          by law. Your continued use of the website after a revision to the
          Privacy Policy indicates your acceptance and agreement to the current
          Privacy Policy. We recommend that you periodically review the Privacy
          Policy to make sure you understand and are up-to-date on how we&#39;re
          keeping your information safe.
        </p>

        <h3 className="page-sub-heading">
          16. Effective Date of this Privacy Policy: March 20, 2022
        </h3>
      </StyledPrivacyWrapper>
    </SectionWrapper>
  );
}

export default PrivacyPolicy;
