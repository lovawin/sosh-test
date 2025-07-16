import SectionWrapper from "components/sectionWrapper";
import { NavLink } from "react-router-dom";
import { StyledUseTermsWrapper } from "./style";
import Routes from "constants/routes";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
function TermsOfService() {
  const docs = [
    { uri: "/docs/Sosh NFT Platform - Terms of Use.docx" }, // You can also use a public URL
  ];

  return (
    <SectionWrapper>
      <StyledUseTermsWrapper>
        <h1 className="page-heading">Terms of Service</h1>
        <p>Last Updated: 04/15/2024</p>
        <p className="body-text">
          Welcome! Take a moment to go through these Terms of Service (the
          “Terms”) carefully as they&#39;re important for using our website and
          interface at https://soshnft.io/ (the “Site”, “Webstite”, or the “Sosh
          NFT Platform”), along with any downloadable blockchain currency
          management software (the “Software”), mobile applications (“Apps”),
          and other services and resources provided by Sosh, Inc. (“Sosh,” “we,”
          “our”). These help you interact with certain decentralized
          cryptographic protocols, make and sell non-fungible tokens (“NFTs”),
          manage cryptographic currencies, and more. We call these collectively
          the “Services.”
        </p>
        <p className="body-text">
          <b>
            By using the Sosh NFT Platform or by clicking to accept or agree to
            the Terms of Service when this option is made available to you, you
            accept and agree to be bound and abide by these Terms of Service and
            our Privacy Policy, found at https://www.soshnft.io/privacy-policy,
            incorporated herein by reference.
          </b>{" "}
          &nbsp; If you do not want to agree to these Terms of Service or the
          Privacy Policy, you must not access or use the Sosh NFT Platform.
        </p>

        <p className="body-text">
          To use or access the Sosh NFT Platform, you must (a) be 18 or older
          or, if you are from 13 to 17 have your parent or guardian’s consent to
          the terms of these Terms of Service, and (b) possess the ability to
          enter into a binding contract with us and not be barred from doing so
          under any applicable laws. Children under 13 years old are not
          permitted to register for the Sosh NFT Platform, and parents or legal
          guardians may not register on their behalf. If you are a parent or
          legal guardian entering these Terms of Service for your child or a
          child in your legal care, please be aware that you are fully
          responsible for the child&#39;s use of the Sosh NFT Platform,
          including any financial charges, legal liability, and damages they may
          incur, until they reach the age of 18.
        </p>
        <p className="body-text">
          Now, a quick heads-up about arbitration: when you agree to these
          Terms, you&#39;re agreeing to resolve any disputes with Sosh through
          arbitration, except where prohibited by law. Check out Section 18
          “Dispute Resolution” below for more info.
        </p>

        <h3 className="page-sub-heading">1.Agreement to Terms.</h3>
        <p className="body-text">
          By using the Sosh NFT Platform, you&#39;re agreeing to these Terms. If
          you don’t agree, you can&#39;t use the Sosh NFT Platform.
        </p>

        <h3 className="page-sub-heading">
          2.Changes to these Terms or the Sosh NFT Platform
        </h3>
        <p className="body-text">
          We may revise and update these Terms of Service from time to time in
          our sole discretion. All changes are effective immediately when we
          post them and apply to all access to and use of the Website
          thereafter. Your continued use of the Website following the posting of
          revised Terms of Service means that you accept and agree to the
          changes. You are expected to check this page from time to time so you
          are aware of any changes, as they are binding on you.
        </p>

        <div>
          <h3 className="page-sub-heading">
            3. Who May Use the Sosh NFT Platform?
          </h3>
          <p className="body-text">
            <span>(a)</span> &nbsp;
            <b style={{ textDecoration: "underline" }}> Eligibility.</b> You can
            use the Sosh NFT Platform if you're 18 years or older and able to
            make a deal with Sosh. We won't ask for personal info from anyone
            under 13. If we find out someone's under 13, we'll delete their
            info. If you think someone under 13 is using our Service, email us
            at support@soshnft.io
          </p>
          <p className="body-text">
            <span>(b)</span> &nbsp;
            <b style={{ textDecoration: "underline" }}> Following Rules.</b>You
            can only use the Sosh NFT Platform if your local laws allow. You
            promise to follow all the rules when you use the Sosh NFT Platform.
            For example, you can't use the Sosh NFT Platform from a country the
            U.S. government doesn't like, and you can't be on any list the U.S.
            government made. If you use the Sosh NFT Platform outside the U.S.,
            it's your job to make sure it's okay by the local laws. Don't try to
            cheat by using software to hide where you're from. We might check
            where people are using the Sosh NFT Platform from and stop them if
            they're breaking these rules.
          </p>
          <p className="body-text">
            <span>(c)</span> &nbsp;
            <b style={{ textDecoration: "underline" }}> Not Allowed.</b> You
            can't use the Sosh NFT Platform to collect info or do stuff like
            scraping without our okay. Doing these things without permission
            breaks the rules and might get you in trouble.
          </p>
          <h3 className="page-sub-heading">4. Our Mission:</h3>
          <p className="body-text">
            The Sosh NFT Platform is an NFT marketplace that allows users to
            license commercial rights to their social media content on
            Instagram, X (formerly Twitter), TikTok, and YouTube. Users register
            and create accounts on the platform and connect their social media
            profiles to their cryptocurrency wallet. They mint NFTs for their
            social media content by pasting the link to the specific social
            media post and using the minting function on the website to mint an
            NFT that is registered for that specific post. They can then list
            that NFT for sale or accept offers on that specific NFT.
            Additionally, users can purchase other NFTs that are linked to the
            social media content of other users.
          </p>
          <h3 className="page-sub-heading">5. About the Sosh NFT Platform.</h3>
          <p className="body-text">
            <span>(a)</span> &nbsp;
            <b style={{ textDecoration: "underline" }}>
              {" "}
              The Sosh NFT Platform
            </b>{" "}
            Our Sosh NFT Platform helps you interact with protocols and
            blockchains, letting you bid on, buy, trade, and sell NFTs. Sosh
            provides the Sosh NFT Platform, an interface to do all this. You can
            also create and put NFTs up for sale.
            <div style={{ padding: "20px" }} className="para-containers">
              <span style={{ display: "flex", gap: "20px" }}>
                {" "}
                <b>(i)</b>{" "}
                <p className="body-text">
                  Joining: You can use the Sosh NFT Platform by linking your
                  digital wallet(s) to buy, store, and make transactions with
                  cryptocurrency. Before you buy or sell any digital asset,
                  we'll ask you to download a supported electronic wallet
                  extension and connect your digital wallets. Your orders are
                  then processed through the extension.
                </p>
              </span>
              <span style={{ display: "flex", gap: "20px" }}>
                {" "}
                <b>(ii)</b>{" "}
                <p className="body-text">
                  SOSH NFT PLATFORM IS NOT A BROKER, FINANCIAL INSTITUTION, OR
                  CREDITOR. THE SERVICES ARE AN ADMINISTRATIVE PLATFORM ONLY.
                  SOSH FACILITATES TRANSACTIONS BETWEEN THE PURCHASER AND SELLER
                  ON THE SOSH NFT PLATFORM BUT IS NOT A PARTY TO ANY AGREEMENT
                  BETWEEN THE PURCHASER AND SELLER OF NFTs OR BETWEEN ANY USERS.
                </p>
              </span>
              <span style={{ display: "flex", gap: "20px" }}>
                {" "}
                <b>(iii)</b>{" "}
                <p className="body-text">
                  YOU BEAR FULL RESPONSIBILITY FOR VERIFYING THE IDENTITY,
                  LEGITIMACY, AND AUTHENTICITY OF ASSETS YOU PURCHASE THROUGH
                  THE SOSH NFT PLATFORM. NOTWITHSTANDING INDICATORS AND MESSAGES
                  THAT SUGGEST VERIFICATION, SOSH MAKES NO CLAIMS ABOUT THE
                  IDENTITY, LEGITIMACY, OR AUTHENTICITY OF ASSETS ON THE SOSH
                  NFT PLATFORM.
                </p>
              </span>
            </div>
            <span>(b)</span> &nbsp;
            <b style={{ textDecoration: "underline" }}>
              {" "}
              Transactions Are Conducted on the Blockchain.
            </b>{" "}
            While Sosh offers a marketplace for NFTs, it does not buy, sell or
            take custody or possession of any NFTs, nor does it act as an agent
            or custodian for any user of the Sosh NFT Platform. Instead, each
            NFT that is listed for sale will enable a blockchain-based smart
            contract deployed by Sosh to ensure that the purported seller owns
            such NFT. Each such NFT is transferred automatically upon
            consummation of its sale through the relevant blockchain network. If
            you elect to mint, buy, or sell any NFTs, any transactions that you
            engage in will be conducted solely through the relevant blockchain
            network governing such NFT. You will be required to make or receive
            payments exclusively through the cryptocurrency wallet you have
            connected to the Sosh NFT Platform. We will have no insight into or
            control over these payments or transactions, nor do we have the
            ability to reverse any transactions. Accordingly, we will have no
            liability to you or to any third party for any claims or damages
            that may arise as a result of any transactions that you engage in
            via the Service. There may be royalties associated with the
            secondary sale of any NFT. You acknowledge and agree that the
            payment of any such royalty shall, in certain circumstances, be
            programmed to be self-executing via a blockchain network’s
            nonfungible token standard or another means and Sosh does not have
            any control or ability to direct such funds or the obligation to
            collect such fees.
          </p>
          <p className="body-text">
            <span>(c)</span> &nbsp;
            <b style={{ textDecoration: "underline" }}>
              {" "}
              Terms Applicable to Purchasers and Sellers.
            </b>{" "}
            While Sosh offers a marketplace for NFTs, it does not buy, sell or
          </p>
          <p className="body-text">
            <span>(d)</span> &nbsp; take custody or possession of any NFTs, nor
            does it act as an agent
          </p>
          <p className="body-text">
            <span>(e)</span> &nbsp; or custodian for any user of the Sosh NFT
            Platform. Instead, each
          </p>
          <p className="body-text">
            <span>(f)</span> &nbsp; NFT that is listed for sale will enable a
            blockchain-based smart
          </p>
          <p className="body-text">
            <span>(g)</span> &nbsp; contract deployed by Sosh to ensure that the
            purported seller owns
          </p>
          <p className="body-text">
            <span>(h)</span> &nbsp; such NFT. Each such NFT is transferred
            automatically upon
          </p>
          <p className="body-text">
            <span>(i)</span> &nbsp; consummation of its sale through the
            relevant blockchain network. If
          </p>
          <p className="body-text">
            <span>(j)</span> &nbsp; you elect to mint, buy, or sell any NFTs,
            any transactions that you
          </p>
          <p className="body-text">
            <span>(k)</span> &nbsp;engage in will be conducted solely through
            the relevant blockchain
          </p>
          <p className="body-text">
            <span>(l)</span> &nbsp; network governing such NFT. You will be
            required to make or receive
          </p>
          <p className="body-text">
            <span>(m)</span> &nbsp; payments exclusively through the
            cryptocurrency wallet you have
          </p>
          <p className="body-text">
            <span>(n)</span> &nbsp; connected to the Sosh NFT Platform. We will
            have no insight into or
          </p>
          <p className="body-text">
            <span>(o)</span> &nbsp; control over these payments or transactions,
            nor do we have the
          </p>
          <p className="body-text">
            <span>(p)</span> &nbsp; ability to reverse any transactions.
            Accordingly, we will have no
          </p>
          <p className="body-text">
            <span>(q)</span> &nbsp; liability to you or to any third party for
            any claims or damages
          </p>
          <p className="body-text">
            <span>(r)</span> &nbsp; that may arise as a result of any
            transactions that you engage in
          </p>
          <p className="body-text">
            <span>(s)</span> &nbsp; via the Service. There may be royalties
            associated with the
          </p>
          <p className="body-text">
            <span>(t)</span> &nbsp; secondary sale of any NFT. You acknowledge
            and agree that the
          </p>
          <p className="body-text">
            <span>(u)</span> &nbsp; payment of any such royalty shall, in
            certain circumstances, be
          </p>
          <p className="body-text">
            <span>(v)</span> &nbsp; programmed to be self-executing via a
            blockchain network’s
          </p>
          <p className="body-text">
            <span>(w)</span> &nbsp; nonfungible token standard or another means
            and Sosh does not have
          </p>
          <p className="body-text">
            <span>(x)</span> &nbsp; any control or ability to direct such funds
            or the obligation to
          </p>
          <p className="body-text">
            <span>(y)</span> &nbsp; collect such fees.
          </p>
          <div style={{ padding: "20px" }} className="para-containers">
            <span style={{ display: "flex", gap: "20px" }}>
              {" "}
              <b>(i) &nbsp; </b>{" "}
              <p className="body-text">
                <span style={{ textDecoration: "underline" }}>
                  Purchase Terms
                </span>
                &nbsp; When the terms of sale for an NFT are displayed on the
                Sosh NFT Platform, all such terms are determined by the
                purchasers and sellers, and the sale and purchase of NFTs are
                subject to these terms (referred to as "Purchase Terms"),
                including matters such as the use of the NFT Content or
                associated benefits. Sosh is not a party to these Purchase
                Terms, as they are solely between the purchaser and the seller.
                Sosh is not responsible for ensuring compliance with these terms
                or mediating disputes related to them, including disputes
                regarding authenticity or intellectual property rights
                associated with the NFT. Purchasers and sellers are solely
                responsible for establishing, agreeing to, and enforcing
                Purchase Terms, as well as resolving disputes resulting from any
                breaches. Sellers must adhere to and fulfill the Purchase Terms
                for any NFTs they sell. When you purchase an NFT through the
                Sosh NFT Platform, you own all personal property rights to the
                electronic record comprising the NFT, allowing you to sell or
                otherwise dispose of it. However, unless explicitly stated in
                the Purchase Terms, these rights do not include ownership of the
                intellectual property rights in any NFT Content.
              </p>
            </span>
            <span style={{ display: "flex", gap: "20px" }}>
              {" "}
              <b>(ii)</b>{" "}
              <p className="body-text">
                <span style={{ textDecoration: "underline" }}>
                  Costs and Fees
                </span>
                &nbsp; Transactions on the Sosh NFT Platform may incur fees that
                support the NFT creators and the Sosh NFT Platform. These fees
                include a flat minting fee for creating an NFT using the NFT
                minting contract, as well as a percentage of the total sale
                value for each NFT sold on the NFT marketplace contract. For
                example, if an NFT is sold for $100 and the fee is 10%, the NFT
                marketplace contract will retain $10 from the sale, and the
                seller will receive $90 as revenue. Additionally, gas fees and
                hosting fees may apply, which users authorize Sosh to
                automatically charge or deduct from the amounts paid by the
                purchaser or received by the seller. It's important to note that
                payments made to creators do not include any Taxes, and Sosh
                bears no responsibility for the payment of such Taxes, which are
                the responsibility of the parties involved. Sellers or
                purchasers are responsible for covering all fees, Taxes, and gas
                fees associated with their transactions.
              </p>
            </span>
            <span style={{ display: "flex", gap: "20px" }}>
              {" "}
              <b>(iii)</b>{" "}
              <p className="body-text">
                <span style={{ textDecoration: "underline" }}>
                  Revenue Share and Fees
                </span>
                &nbsp; Users receive revenue from the initial sale of their NFTs
                on the Sosh NFT Platform, minus the transaction fee. The
                transaction fee, agreed upon when listing the NFT for sale,
                represents a percentage of the revenue generated from the sale.
                This fee structure ensures that creators are compensated for
                their work while supporting the operation of the platform. The
                transaction fee may vary.
              </p>
            </span>
          </div>
          <p className="body-text">
            <span>(z) </span> &nbsp;
            <span style={{ textDecoration: "underline" }}>Taxes</span> &nbsp;
            You bear full responsibility for all expenses associated with your
            use of the Sosh NFT Platform, as well as for identifying,
            collecting, reporting, and remitting all applicable Taxes. In this
            context, "Taxes" refers to taxes, duties, levies, tariffs, and other
            governmental fees that you may be legally obligated to collect and
            submit to governmental entities, along with any similar municipal,
            state, federal, and national indirect or other withholding taxes, as
            well as personal or corporate income taxes. It is your sole
            responsibility to maintain accurate records of all relevant tax
            matters and fulfill any reporting obligations related to your use of
            the Sosh NFT Platform. You must also ensure the accuracy of any
            information submitted to tax authorities, including data derived
            from the Sosh NFT Platform. We retain the right to disclose any
            activity conducted through the Sosh NFT Platform to relevant tax
            authorities as mandated by applicable laws.
          </p>
          <p className="body-text">
            <span>(aa) </span> &nbsp;
            <span style={{ textDecoration: "underline" }}>
              Suspension or Termination
            </span>{" "}
            &nbsp; We reserve the right to suspend or terminate your access to
            the Sosh NFT Platform at any time, in compliance with applicable
            laws, directives from governmental authorities, or if we, at our
            sole and reasonable discretion, determine that you are violating
            these Terms or the terms of any third-party service provider. Such
            suspension or termination does not constitute a breach of these
            Terms by Sosh. As part of our anti-money laundering, anti-terrorism,
            anti-fraud, and other compliance protocols, we may implement
            reasonable restrictions and controls on your or any beneficiary's
            ability to utilize the Sosh NFT Platform. These measures may
            include, under justified circumstances, rejecting transaction
            requests, freezing funds, or otherwise limiting your access to the
            Sosh NFT Platform.
          </p>
          <h3 className="page-sub-heading">6. User Generated Content :</h3>
          <p className="body-text">
            <span>(a)</span> &nbsp;The Sosh Apps may contain reviews, comments,
            message boards, profiles, activity feeds, and other interactive
            features (collectively, "Interactive Sosh NFT Platform") that allow
            users to post, submit, publish, display, or transmit to other users
            or other persons (hereinafter, "post") content or materials
            (collectively, "User Generated Content") on or through the Sosh
            Apps. All User Generated Content must comply with the Content
            Standards set out in these Terms of Service. Any User Contribution
            you post to the Sosh Apps will be considered non-confidential and
            non-proprietary. By providing any User Contribution on the Sosh
            Apps, you grant us and our affiliates and service providers, and
            each of their and our respective licensees, successors, and assigns
            the right to use, reproduce, modify, perform, display, distribute,
            and otherwise disclose to third parties any such material.
            Notwithstanding the foregoing, we reserve the right to remove one or
            more of your User Contributions for any reason or for no reason at
            our sole discretion.
          </p>
          <p className="body-text">
            <span>(b)</span> &nbsp;You represent and warrant that:
            <div style={{ padding: "20px" }} className="para-containers">
              <span style={{ display: "flex", gap: "20px" }}>
                {" "}
                <b>(i) &nbsp; </b>{" "}
                <p className="body-text">
                  You own or control all rights in and to the User Generated
                  Content and have the right to grant the license granted above
                  to us and our affiliates and service providers, and each of
                  their and our respective licensees, successors, and assigns.
                </p>
              </span>
              <span style={{ display: "flex", gap: "20px" }}>
                {" "}
                <b>(ii)</b>{" "}
                <p className="body-text">
                  All of your User Generated Content do and will comply with
                  these Terms of Service.
                </p>
              </span>
            </div>
            You understand and acknowledge that you are responsible for any User
            Generated Content you submit or contribute, and you, not the Sosh,
            have full responsibility for such content, including its legality,
            reliability, accuracy, and appropriateness. We are not responsible
            or liable to any third party for the content or accuracy of any User
            Generated Content posted by you or any other user of the Sosh Apps.
          </p>
          <h3 className="page-sub-heading">7.Content Standards:</h3>
          <p className="body-text">
            We may revise and update these Terms of Service from time to time in
            our sole discretion. All changes are effective immediately when we
            post them and apply to all access to and use of the Website
            thereafter. Your continued use of the Website following the posting
            of revised Terms of Service means that you accept and agree to the
            changes. You are expected to check this page from time to time so
            you are aware of any changes, as they are binding on you.
            <p className="body-text">
              {" "}
              <span>(a)</span> &nbsp; Contain any material that is defamatory,
              obscene, indecent, abusive, offensive, harassing, violent,
              hateful, inflammatory, or otherwise objectionable.{" "}
            </p>{" "}
            <p className="body-text">
              {" "}
              <span>(b)</span> &nbsp; Promote sexually explicit or pornographic
              material, violence, or discrimination based on race, sex,
              religion, nationality, disability, sexual orientation, or age.{" "}
            </p>{" "}
            <p className="body-text">
              {" "}
              <span>(c)</span> &nbsp; Infringe any patent, trademark, trade
              secret, copyright, or other intellectual property or other rights
              of any other person.{" "}
            </p>{" "}
            <p className="body-text">
              {" "}
              <span>(d)</span> &nbsp; Violate the legal rights (including the
              rights of publicity and privacy) of others or contain any material
              that could give rise to any civil or criminal liability under
              applicable laws or regulations or that otherwise may be in
              conflict with these Terms of Service and our Privacy Policy.{" "}
            </p>{" "}
            <p className="body-text">
              {" "}
              <span>(e)</span> &nbsp; Be likely to deceive any person.{" "}
            </p>{" "}
            <p className="body-text">
              {" "}
              <span>(f)</span> &nbsp; Promote any illegal activity, or advocate,
              promote, or assist any unlawful act.{" "}
            </p>{" "}
            <p className="body-text">
              {" "}
              <span>(g)</span> &nbsp; Cause annoyance, inconvenience, or
              needless anxiety or be likely to upset, embarrass, alarm, or annoy
              any other person.{" "}
            </p>{" "}
            <p className="body-text">
              {" "}
              <span>(h)</span> &nbsp; Impersonate any person or misrepresent
              your identity or affiliation with any person or organization.{" "}
            </p>{" "}
            <p className="body-text">
              {" "}
              <span>(i)</span> &nbsp; Involve commercial activities or sales,
              such as contests, sweepstakes, and other sales promotions, barter,
              or advertising.{" "}
            </p>
          </p>
          <h3 className="page-sub-heading">8.License:</h3>
          <p className="body-text">
            <span>(a)</span>&nbsp; License Grant Commencing at the time Sosh
            receives the associated payment for any Sosh Apps or Sosh NFT
            Platform, Sosh grants to User a non-exclusive, non-transferable,
            royalty-free license to use the Sosh Apps or Sosh NFT Platform
            identified by Sosh as being in connection with its use of the Sosh
            Apps. Such license shall continue only for so long as necessary for
            User to utilize such Sosh Apps. Such license shall not extend beyond
            termination of this Terms of Service nor to any period during which
            User is in material breach under this Terms of Service.
          </p>
          <p className="body-text">
            <span>(b)</span>&nbsp; Scope of Use.Except in accordance with the
            terms herein or as reasonably required for User to avail itself of
            the intended functionality of the Sosh Apps as contemplated, User
            will not, directly or indirectly: reverse engineer, decompile,
            disassemble, or otherwise attempt to discover the source code,
            object code, model structure, parameters, or underlying structure,
            ideas, know-how, or algorithms relevant to the Sosh Apps or any
            software, documentation, or data related to the Sosh Apps. This
            includes, but is not limited to, any proprietary aspects of machine
            learning models employed by the Sosh Apps; modify, translate, or
            create derivative works based on the Sosh Apps or use output from
            the Sosh Apps to develop models that compete with Sosh. User shall
            not create derivative works based on the Sosh Apps (except to the
            extent expressly permitted by Sosh or authorized within the Sosh
            Apps); use the Sosh Apps otherwise for the benefit of a third party;
            or remove any proprietary notices or labels.
          </p>
          <p className="body-text">
            <span>(c)</span>&nbsp; Sosh Policy; Applicable Law. User represents,
            covenants, and warrants that User will use the Sosh Apps only in
            compliance with Sosh’s standard published policies then in effect,
            including without limitation the Sosh’s Privacy Policy as found
            at&nbsp;
            <a
              href="https://www.aurorahelps.app/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
            >
              www.aurorahelps.app/privacy-policy
            </a>{" "}
            (the “Policy”).
          </p>
          <h3 className="page-sub-heading">9.Intellectual Property Rights :</h3>
          <p className="body-text">
            <span>(a)</span>&nbsp; <strong>User Ownership.</strong>
            <p className="body-text">
              <span>(i)</span>&nbsp; As between User and Sosh, all right, title,
              and interest (including without limitation all Intellectual
              Property Rights) in and to User Content shall be and remain the
              sole and complete property of User. If the development of the Sosh
              Apps results in new derivative works of User Content that
              constitute audio or visual assets (excluding AI models), then all
              right, title, and interest in User Content Derivative Works
              (including all Intellectual Property Rights therein) shall belong
              to User and shall be deemed to be User Content for purposes of the
              licenses granted pursuant to the Terms. Sosh hereby irrevocably
              and exclusively grants, transfers, and assigns to User all
              Intellectual Property Rights that Sosh has, or may have, in or to
              User Content Derivative Works (excluding AI models). With respect
              to any so-called “moral rights” exercisable with respect to User
              Content Derivative Works (excluding AI models), Sosh hereby
              unconditionally waives such rights and the enforcement thereof.
            </p>
            <p className="body-text">
              <span>(ii)</span>&nbsp; Notwithstanding the above, in cases where
              customers receive the software for free in exchange for allowing
              the Sosh to train AI models on their User Content, the resulting
              AI models and any derived intellectual property shall be owned by
              the Sosh. This ownership is separate and distinct from User
              Content Derivative Works as specified in this clause.
            </p>
          </p>
          <p className="body-text">
            <span>(b)</span>&nbsp; <strong>Permitted Activity.</strong>{" "}
            Notwithstanding the foregoing, User acknowledges that Sosh may
            develop and distribute software and applications using Sosh
            Materials and that nothing in the Terms shall prevent the foregoing.
          </p>
          <p className="body-text">
            <span>(c)</span>&nbsp;{" "}
            <strong>Marks and other Intellectual Property.</strong> All
            trademarks, service marks, trade names, domain names, slogans,
            logos, and other indicia of origin that appear on or in connection
            with any aspect of the Sosh Apps are either the property of the
            Sosh, its affiliates, or licensors. The Sosh retains the right to
            rescind and terminate the limited license granted hereunder at any
            point, for any reason. All rights not expressly granted herein by
            the Sosh to you are fully reserved by the Sosh, its advertisers, and
            licensors. Some of the Sosh and product names, logos, brands, and
            other trademarks featured or referred to within the Sosh Apps may
            not be owned by us and are the property of their respective
            trademark holders. These trademark holders are not affiliated with,
            nor do they sponsor or endorse, the Sosh, the Sosh Apps, the
            Websites, and/or our products and services.
          </p>
          <p className="body-text">
            <span>(d)</span>&nbsp;{" "}
            <strong>Design and Sosh Development Tools.</strong> Sosh has certain
            “Design and Development Tools” that it may from time to time use to
            perform the Sosh Apps and integrate into the Sosh Apps. Sosh will
            retain ownership of all of its Design and Development Tools, which
            are defined as: (i) any generic materials, information, inventions,
            methods, procedures, technology, and know-how common to the software
            industry that do not embody and are not derived from the User
            Confidential Information or User Content; and (ii) any tools, both
            in executable code and source code form, which Sosh creates,
            licenses, or develops. In no event will the Design and Development
            Tools include any User Content or User Confidential Information. In
            the event that Sosh incorporates any Design and Development Tools
            into the Sosh Apps, Sosh hereby grants the User a non-exclusive,
            transferable, sub-licensable, irrevocable, worldwide, fully-paid-up,
            royalty-free license and right to use, display, perform, transmit,
            and otherwise exploit the Design and Development Tools in
            perpetuity, solely as part of the Sosh Apps, including any
            modifications to Sosh Apps. The User may not, however, reverse
            engineer, decompile, or disassemble the Design and Development Tools
            or otherwise attempt to derive the source code, or permit or
            encourage any third party to do any of the foregoing.
          </p>
          <h3 className="page-sub-heading">
            10.Intellectual Property Rights :{" "}
            <span style={{ fontWeight: "lighter", fontSize: "22px" }}>
              {" "}
              You agree not to do any of the following:
            </span>
          </h3>
          <p className="body-text">
            <span>(a)</span>&nbsp; Use, display, mirror, or frame the Sosh NFT
            Platform or any individual element within the Sosh NFT Platform,
            Sosh’ name, any Sosh trademark, logo, or other proprietary
            information, or the layout and design of any page or form contained
            on a page, without Sosh’ express written consent.
          </p>
          <p className="body-text">
            <span>(b)</span>&nbsp; Access, tamper with, or use non-public areas
            of the Sosh NFT Platform, Sosh’ computer systems, or the technical
            delivery systems of Sosh’ providers.
          </p>
          <p className="body-text">
            <span>(c)</span>&nbsp; Attempt to probe, scan, or test the
            vulnerability of any Sosh system or network or breach any security
            or authentication measures.
          </p>
          <p className="body-text">
            <span>(d)</span>&nbsp; Avoid, bypass, remove, deactivate, impair,
            descramble, or otherwise circumvent any technological measure
            implemented by Sosh, Sosh’ providers, or any other third party to
            protect the Sosh NFT Platform.
          </p>
          <p className="body-text">
            <span>(e)</span>&nbsp; Attempt to access or search the Sosh NFT
            Platform or download content from the Sosh NFT Platform using any
            engine, software, tool, agent, device, or mechanism (including
            spiders, robots, crawlers, data mining tools, or the like) other
            than the software and/or search agents provided by Sosh or generally
            available third-party web browsers.
          </p>
          <p className="body-text">
            <span>(f)</span>&nbsp; Send any unsolicited or unauthorized
            advertising, promotional materials, email, junk mail, spam, chain
            letters, or other forms of solicitation.
          </p>
          <p className="body-text">
            <span>(g)</span>&nbsp; Use the Sosh NFT Platform, or any portion
            thereof, for any commercial purpose or for the benefit of any third
            party or in any manner not permitted by these Terms.
          </p>
          <p className="body-text">
            <span>(h)</span>&nbsp; Forge any TCP/IP packet header or any part of
            the header information in any email or newsgroup posting or in any
            way use the Sosh NFT Platform to send altered, deceptive, or false
            source-identifying information.
          </p>
          <p className="body-text">
            <span>(i)</span>&nbsp; Attempt to decipher, decompile, disassemble,
            or reverse engineer any of the software used to provide the Sosh NFT
            Platform.
          </p>
          <p className="body-text">
            <span>(j)</span>&nbsp; Interfere with or attempt to interfere with
            the access of any user, host, or network, including, without
            limitation, sending a virus, overloading, flooding, spamming, or
            mail-bombing the Sosh NFT Platform.
          </p>
          <p className="body-text">
            <span>(k)</span>&nbsp; Collect or store any personally identifiable
            information from the Sosh NFT Platform from other users without
            their express permission.
          </p>
          <p className="body-text">
            <span>(l)</span>&nbsp; Impersonate or misrepresent your affiliation
            with any person or entity.
          </p>
          <p className="body-text">
            <span>(m)</span>&nbsp; Create or list counterfeit items (including
            any NFTs).
          </p>
          <p className="body-text">
            <span>(n)</span>&nbsp; Engage or assist in any activity that
            violates any law, statute, ordinance, regulation, or sanctions
            program, including but not limited to the U.S. Department of
            Treasury’s Office of Foreign Assets Control (“OFAC”), or that
            involves proceeds of any unlawful activity (including but not
            limited to money laundering or terrorist financing).
          </p>
          <p className="body-text">
            <span>(o)</span>&nbsp; Engage in wash trading, front running, pump
            and dump trading, ramping, cornering, or other deceptive or
            manipulative trading activities, including but not limited to:
            <ul className="nested-list">
              <li>
                Trading an NFT at successively lower or higher prices for the
                purpose of creating or inducing a false, misleading, or
                artificial appearance of activity in such NFT.
              </li>
              <li>
                Unduly or improperly influencing the market price for such NFT
                or establishing a price that does not reflect the true state of
                the market in such NFT.
              </li>
              <li>
                Executing or causing the execution of any transaction in an NFT
                that involves no material change in the beneficial ownership
                thereof.
              </li>
              <li>
                Participating in, facilitating, assisting, or knowingly
                transacting with any pool, syndicate, or joint account organized
                for the purpose of unfairly or deceptively influencing the
                market price of an NFT.
              </li>
            </ul>
          </p>
          <p className="body-text">
            <span>(p)</span>&nbsp; Use the Sosh NFT Platform to participate in
            fundraising for a business, protocol, or platform, including but not
            limited to creating, listing, or buying assets redeemable for
            financial instruments, securities, or assets that offer financial
            rewards, including DeFi yield bonuses, staking bonuses, and burn
            discounts.
          </p>
          <p className="body-text">
            <span>(q)</span>&nbsp; Fabricate in any way any transaction or
            process related thereto.
          </p>
          <p className="body-text">
            <span>(r)</span>&nbsp; Place misleading bids or offers.
          </p>
          <p className="body-text">
            <span>(s)</span>&nbsp; Disguise or interfere in any way with the IP
            address of the computer you are using to access the Sosh NFT
            Platform or otherwise prevent us from correctly identifying it.
          </p>
          <p className="body-text">
            <span>(t)</span>&nbsp; Transmit, exchange, or otherwise support the
            direct or indirect proceeds of criminal or fraudulent activity.
          </p>
          <p className="body-text">
            <span>(u)</span>&nbsp; Violate any applicable law or regulation.
          </p>
          <p className="body-text">
            <span>(v)</span>&nbsp; Encourage or enable any other individual to
            do any of the foregoing.
          </p>
          Sosh is not obligated to monitor access to or use of the Sosh NFT
          Platform or to review or edit any content. However, we have the right
          to do so for the purpose of operating the Sosh NFT Platform, to ensure
          compliance with these Terms and to comply with applicable law or other
          legal requirements. We reserve the right, but are not obligated, to
          remove or disable access to any content, including User Content, at
          any time and without notice, including, but not limited to, if we, at
          our sole discretion, consider it objectionable or in violation of
          these Terms. We have the right to investigate violations of these
          Terms or conduct that affects the Sosh NFT Platform. We may also
          consult and cooperate with law enforcement authorities to prosecute
          users who violate the law. The sale of stolen assets, assets taken
          without authorization, and otherwise illegally obtained assets on the
          Service is prohibited. If you have reason to believe that an asset
          listed on the Service was illegally obtained, please contact us
          immediately. Listing illegally obtained assets may result in your
          listings being canceled, your assets being hidden, or you being
          suspended from the Sosh NFT Platform.
          <h3 className="page-sub-heading">
            11.DMCA Copyright Policy: :{" "}
            <span style={{ fontWeight: "lighter", fontSize: "22px" }}>
              {" "}
              Sosh deals with copyright infringement in accordance with the
              Digital Millennium Copyright Act (DMCA). Sosh respects the
              intellectual property of others and asks that users of our Sosh
              NFT Platform do the same. In accordance with the Digital
              Millennium Copyright Act (DMCA), if you believe that your work has
              been copied in a way that constitutes copyright infringement, or
              your intellectual property rights have been otherwise violated,
              please provide us the following:
            </span>
          </h3>
          <p className="body-text">
            <span>(a)</span>&nbsp; A description of the copyrighted work or
            other intellectual property that you claim has been infringed.
          </p>
          <p className="body-text">
            <span>(b)</span>&nbsp; A description of where the material that you
            claim is infringing is located on the Sosh NFT Platform.
          </p>
          <p className="body-text">
            <span>(c)</span>&nbsp; A statement by you that you have a good faith
            belief that the disputed use is not authorized by the copyright or
            intellectual property owner, its agent, or the law.
          </p>
          <p className="body-text">
            <span>(d)</span>&nbsp; A statement by you, made under penalty of
            perjury, that the above information in your notice is accurate and
            that you are the copyright or intellectual property owner or
            authorized to act on the copyright or intellectual property owner's
            behalf.
          </p>
          <p className="body-text">
            <span>(e)</span>&nbsp; Your address, telephone number, and email
            address.
          </p>
          <p className="body-text">
            <span>(f)</span>&nbsp; An electronic or physical signature of the
            person authorized to act on behalf of the owner of an exclusive
            right that is allegedly infringed.
          </p>
          <p className="body-text">
            Please note that any misrepresentation of material fact (falsities)
            in a written notification automatically subjects the complaining
            party to liability for any damages, costs and attorney’s fees
            incurred by us in connection with the written notification and
            allegation of copyright infringement. It is the policy of the Sosh
            to disable the accounts of users who repeatedly post infringing
            material on the Sosh NFT Platform
          </p>
          <h3 className="page-sub-heading">
            12. Links to Third Party Websites or Resources.
            <span style={{ fontWeight: "lighter", fontSize: "22px" }}>
              {" "}
              The Sosh NFT Platform (including the Apps) may allow you to access
              third-party websites or other resources. We provide access only as
              a convenience and are not responsible for the content, products or
              services on or available from those resources, websites, or links
              displayed on such resources or websites. You acknowledge sole
              responsibility for and assume all risk arising from your use of
              any third-party resources or websites. The Sosh NFT Platform
              doesn't cover interactions with our third-party API providers,
              each of which has its own terms. And remember, we're not a bank or
              financial institution, so we don't offer investment or financial
              advice.
            </span>
          </h3>
          <h3 className="page-sub-heading">
            13.Termination
            <span style={{ fontWeight: "lighter", fontSize: "22px" }}>
              {" "}
              Notwithstanding anything contained in these Terms, we may suspend,
              modify or terminate your access to and use of the Sosh NFT
              Platform and the applicability of these Terms at our sole
              discretion, at any time and without notice to you. You may
              disconnect your digital wallet at any time. You acknowledge and
              agree that we shall have no liability or obligation to you in such
              an event and that you will not be entitled to a refund of any
              amounts that you have already paid to us or any third party, to
              the fullest extent permitted by applicable law. Expiration or
              termination of this Agreement will not relieve either Party of any
              liability that has accrued as of the date of expiration or
              termination.
            </span>
          </h3>
          <h3 className="page-sub-heading">
            14.Warranty Disclaimers.
            <span style={{ fontWeight: "lighter", fontSize: "22px" }}>
              {" "}
              THE SERVICES PROVIDED, INCLUDING THE SOFTWARE, PROMOTIONS TOOL,
              ANY CONTENT CONTAINED WITHIN, AND ANY NFTS (INCLUDING ASSOCIATED
              NFT CONTENT) LISTED THEREIN, ARE OFFERED ON AN "AS IS" AND "AS
              AVAILABLE" BASIS WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
              WHETHER EXPRESS OR IMPLIED. SOSH (AND ITS SUPPLIERS) MAKE NO
              WARRANTY THAT THE SERVICES WILL MEET YOUR REQUIREMENTS, BE
              AVAILABLE ON AN UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE
              BASIS, OR BE ACCURATE, RELIABLE, COMPLETE, LEGAL, OR SAFE. SOSH
              DISCLAIMS ALL OTHER WARRANTIES OR CONDITIONS, EXPRESS OR IMPLIED,
              INCLUDING ANY IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
              PARTICULAR PURPOSE, QUIET ENJOYMENT, OR NON-INFRINGEMENT, TO THE
              MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, REGARDING THE
              SERVICES, ANY CONTENT CONTAINED WITHIN, AND ANY NFTS LISTED
              THEREIN. WE ALSO EXPLICITLY DISCLAIM ALL LIABILITY OR
              RESPONSIBILITY ASSOCIATED WITH THIRD-PARTY SERVICES. NEITHER THE
              CONTENT HEREIN NOR ANY UTILIZATION OF THE SERVICES IN CONJUNCTION
              WITH THIRD-PARTY SERVICES IMPLIES OUR ENDORSEMENT, RECOMMENDATION,
              OR ANY OTHER FORM OF AFFILIATION WITH SUCH THIRD-PARTY SERVICES.
              SOSH NOT ASSERT OR GUARANTEE THAT ANY CONTENT ON THE SERVICES IS
              ACCURATE, COMPLETE, RELIABLE, CURRENT, OR FREE FROM ERRORS. WE
              WILL NOT BE HELD LIABLE FOR ANY LOSS RESULTING FROM ANY ACTION
              TAKEN OR REFRAINED FROM IN RELIANCE ON MATERIAL OR INFORMATION
              FOUND ON THE SERVICES. WHILE SOSH STRIVES TO ENSURE THE SAFETY OF
              YOUR ACCESS TO AND UTILIZATION OF THE SERVICES AND ANY CONTENT
              THEREIN, WE CANNOT ASSURE OR WARRANT THAT THE SERVICES, ANY
              CONTENT WITHIN, ANY NFTS LISTED THEREIN, OR OUR SERVERS ARE DEVOID
              OF VIRUSES OR OTHER HARMFUL COMPONENTS. WE ARE UNABLE TO ENSURE
              THE SECURITY OF ANY DATA DISCLOSED ONLINE. BY PROVIDING
              INFORMATION AND ENGAGING IN ONLINE TRANSACTIONS OVER THE INTERNET,
              YOU ACKNOWLEDGE AND ACCEPT THE INHERENT SECURITY RISKS, AND YOU
              WILL NOT HOLD US RESPONSIBLE FOR ANY SECURITY BREACHES. SOSH WILL
              NOT BE HELD RESPONSIBLE OR LIABLE TO YOU FOR ANY LOSS AND ASSUME
              NO RESPONSIBILITY FOR, AND WILL NOT BE LIABLE TO YOU FOR, ANY USE
              OF THE SERVICES, INCLUDING BUT NOT LIMITED TO ANY LOSSES, DAMAGES,
              OR CLAIMS ARISING FROM: (I) USER ERRORS SUCH AS FORGOTTEN
              PASSWORDS, INCORRECTLY CONSTRUCTED TRANSACTIONS, OR MISTYPED
              WALLET ADDRESSES; (II) SERVER FAILURE OR DATA LOSS; (III) ISSUES
              WITH BLOCKCHAIN NETWORKS, CRYPTOCURRENCY WALLETS, OR CORRUPTED
              FILES; (IV) UNAUTHORIZED ACCESS TO SERVICES; OR (V) ANY ACTIVITIES
              OF THIRD PARTIES, INCLUDING, BUT NOT LIMITED TO, THE USE OF
              VIRUSES, PHISHING, BRUTE-FORCING, OR OTHER MEANS OF ATTACK.
            </span>
          </h3>
          <div style={{ padding: "20px" }} className="para-containers">
            <span style={{ display: "flex", gap: "20px" }}>
              {" "}
              <b>(1.)</b>{" "}
              <p className="body-text">
                NFTS ARE INTANGIBLE DIGITAL ASSETS, EXISTING SOLELY THROUGH THE
                OWNERSHIP RECORD MAINTAINED WITHIN THE RELEVANT BLOCKCHAIN
                NETWORK. ANY TRANSFER OF OWNERSHIP RIGHTS IN ANY UNIQUE DIGITAL
                ASSET TAKES PLACE ON THE DECENTRALIZED LEDGER WITHIN SUCH
                BLOCKCHAIN NETWORK. WE CANNOT ENSURE THAT WE CAN FACILITATE THE
                TRANSFER OF OWNERSHIP OR RIGHTS IN ANY NFTS OR OTHER DIGITAL
                ASSETS, NOR GUARANTEE THE SUCCESS OF ANY ASSOCIATED PAYMENT.
              </p>
            </span>
            <span style={{ display: "flex", gap: "20px" }}>
              {" "}
              <b>(2.)</b>{" "}
              <p className="body-text">
                YOU ARE ENTIRELY RESPONSIBLE FOR VERIFYING THE IDENTITY,
                LEGITIMACY, AND AUTHENTICITY OF ASSETS YOU ACQUIRE THROUGH THE
                SERVICES. DESPITE ANY INDICATORS OR MESSAGES THAT MAY IMPLY
                VERIFICATION, SOSH DOES NOT MAKE ANY ASSERTIONS REGARDING THE
                IDENTITY, LEGITIMACY, OR AUTHENTICITY OF ASSETS AVAILABLE ON THE
                SERVICES.
              </p>
            </span>
            THE SERVICES MAY BECOME UNAVAILABLE DUE TO VARIOUS FACTORS,
            INCLUDING, BUT NOT LIMITED TO, PERIODIC SYSTEM MAINTENANCE,
            SCHEDULED OR UNSCHEDULED EVENTS, ACTS OF NATURE, UNAUTHORIZED
            ACCESS, VIRUSES, DENIAL-OF-SERVICE ATTACKS, TECHNICAL MALFUNCTIONS
            OF THE SERVICES AND/OR TELECOMMUNICATIONS INFRASTRUCTURE, OR
            DISRUPTIONS. THEREFORE, WE EXPLICITLY DISCLAIM ANY EXPRESS OR
            IMPLIED WARRANTY REGARDING THE USE AND/OR AVAILABILITY,
            ACCESSIBILITY, SECURITY, OR PERFORMANCE OF THE SERVICES ARISING FROM
            SUCH FACTORS. WE DO NOT GUARANTEE AGAINST THE POSSIBILITY OF
            DELETION, MISDELIVERY, OR FAILURE TO STORE COMMUNICATIONS,
            PERSONALIZED SETTINGS, OR OTHER DATA. IT'S IMPORTANT TO NOTE THAT
            SOME JURISDICTIONS DO NOT PERMIT THE EXCLUSION OF CERTAIN
            WARRANTIES, SO SOME OF THE ABOVE DISCLAIMERS OF WARRANTIES MAY NOT
            BE APPLICABLE TO YOU.
          </div>
          <h3 className="page-sub-heading">
            15. Who May Use the Sosh NFT Platform?
            <span style={{ fontWeight: "lighter", fontSize: "22px" }}>
              {" "}
              You accept and acknowledge:
            </span>
          </h3>
          <p className="body-text">
            <span>(a)</span>&nbsp; The values and market activity of
            cryptocurrency assets (including NFTs) tend to swing wildly. Changes
            in the value of other digital assets could significantly impact the
            NFTs offered via the Sosh NFT Platform, which themselves may
            experience considerable price swings. While we can't assure that
            purchasers of NFTs won't face losses, it's important to be aware of
            the inherent unpredictability in these markets.
          </p>
          <p className="body-text">
            <span>(b)</span>&nbsp; You are solely responsible for determining
            the Taxes that may apply to your transactions through the Sosh NFT
            Platform. Neither Sosh nor any Sosh affiliates are responsible for
            determining the Taxes that apply to such transactions.
          </p>
          <p className="body-text">
            <span>(c)</span>&nbsp; The transfer of cryptocurrency assets takes
            place within the underlying Blockchain and not directly on the Sosh
            NFT Platform. Transactions involving NFTs may be irreversible,
            meaning that losses resulting from fraudulent or accidental
            transactions may not be retrievable. Additionally, certain
            transactions in NFTs are considered completed upon being recorded on
            a public ledger, which may not align with the date or time when you
            initiated the transaction.
          </p>
          <p className="body-text">
            <span>(d)</span>&nbsp; There are inherent risks when using an
            Internet-based currency, which include, but are not limited to,
            potential issues with hardware, software, and Internet connections,
            as well as the risk of encountering malicious software and
            unauthorized access by third parties to information stored in your
            wallet. You acknowledge and agree that Sosh will not be held
            responsible for any communication failures, disruptions, errors,
            distortions, or delays you may encounter while using the Sosh NFT
            Platform for transactions, regardless of their cause.
          </p>
          <p className="body-text">
            <span>(e)</span>&nbsp; If distributed ecosystems face a lack of
            utilization or public interest in their creation and development, it
            could have adverse effects on their growth and the associated
            applications. Consequently, this could also diminish the potential
            utility or value of a particular NFT.
          </p>
          <p className="body-text">
            <span>(f)</span>&nbsp; The regulatory landscape concerning
            blockchain technologies, cryptocurrencies, and tokens remains
            uncertain, with the potential for new regulations or policies to
            significantly impact the development of the Sosh NFT Platform and
            the utility of NFTs.
          </p>
          <p className="body-text">
            <span>(g)</span>&nbsp; The Sosh NFT Platform might depend on
            third-party platforms to conduct transactions involving
            cryptocurrency assets. If we fail to maintain favorable
            relationships with these platform providers, or if there are
            alterations in their terms, pricing, or market position, or if we
            breach or cannot adhere to their terms and conditions, or if any of
            these platforms experience a decline in market share, popularity, or
            availability for an extended duration, it could adversely affect
            access to and utilization of the Service.
          </p>
          <p className="body-text">
            <span>(h)</span>&nbsp; There are inherent risks involved in
            acquiring user-generated content, including the potential purchase
            of counterfeit or mislabeled assets, assets susceptible to metadata
            decay, assets governed by smart contracts with flaws, and assets
            that could become untransferable. Sosh retains the authority to
            conceal collections, contracts, and assets affected by these or
            other issues. Assets you acquire may become unavailable on Sosh.
            However, the inability to view or access your assets on Sosh shall
            not, under any circumstances, be construed as a basis for a claim
            against Sosh.
          </p>
          <p className="body-text">
            <span>(i)</span>&nbsp; By accessing and utilizing the Sosh NFT
            Platform, you affirm that you comprehend the inherent risks
            associated with cryptographic and blockchain-based systems, and that
            you possess a functional understanding of digital assets. Such
            systems may contain vulnerabilities, failures, or exhibit abnormal
            behavior. Sosh bears no responsibility for any issues pertaining to
            Blockchains or other blockchain-based networks, including forks,
            technical node issues, or any other occurrences resulting in fund,
            NFT, or Rewards losses. You acknowledge that the cost and speed of
            transactions involving cryptographic and blockchain-based systems
            like Ethereum may fluctuate and escalate unpredictably. Moreover,
            you recognize the risk that the value of your digital assets may
            decrease or become entirely depleted while in transit to or from the
            Sosh NFT Platform. You further concede that we hold no liability for
            these variables or risks and cannot be held accountable for any
            resulting losses you may incur while accessing the Sosh NFT
            Platform. Consequently, you comprehend and agree to assume complete
            responsibility for all risks associated with accessing, utilizing,
            and interacting with the Sosh NFT Platform.
          </p>
          <h3 className="page-sub-heading">16. Indemnity</h3>
          <p className="body-text">
            <span>(a)</span>&nbsp; You agree to indemnify, defend (if chosen by
            Sosh), and absolve Sosh and its officers, directors, employees, and
            agents from and against any claims, disputes, demands, liabilities,
            damages, losses, and associated costs and expenses, including but
            not limited to reasonable legal and accounting fees, arising
            directly or indirectly from:
            <ul className="nested-list">
              <li>Your access to or use of the Sosh NFT Platform.</li>
              <li>Your NFT Content.</li>
              <li>Your violation of these Terms.</li>
            </ul>
            Without the prior written consent of Sosh, you are not permitted to
            settle or otherwise resolve any claim falling under this section.
          </p>
          <p className="body-text">
            <span>(b)</span>&nbsp; You will indemnify and keep Sosh and its
            officers, directors, employees, and agents free from any claims,
            disputes, demands, liabilities, damages, losses, and associated
            costs and expenses, including reasonable legal and accounting fees,
            arising directly or indirectly from your breach of your
            representations and warranties.
          </p>
          <h3 className="page-sub-heading">17. Limitation of Liability.</h3>
          <p className="body-text">
            <span>(a)</span>&nbsp;{" "}
            <strong>Exclusion of Certain Types of Damages.</strong> To the
            maximum extent permitted under applicable law, in no event will the
            Company be liable to you for any indirect, special, incidental, or
            consequential damages or for any business losses or loss of profit,
            revenue, contracts, data, goodwill, or other similar losses or
            expenses that arise out of or relate to the use of or inability to
            use the Sosh NFT Platform, including without limitation damages
            related to:
            <ul className="nested-list">
              <li>Any information received from the Sosh NFT Platform.</li>
              <li>
                Removal of your profile information or review (or other content)
                from the Sosh NFT Platform.
              </li>
              <li>
                Any suspension or termination of your access to the Sosh NFT
                Platform.
              </li>
              <li>
                Any failure, error, omission, interruption, defect, delay in
                operation, or transmission of the Sosh NFT Platform.
              </li>
            </ul>
            Even if we are aware of the possibility of any such damages, losses,
            or expenses. SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR
            LIMITATION OF LIABILITY FOR CONSEQUENTIAL OR INCIDENTAL DAMAGES, SO
            THE ABOVE LIMITATION MAY NOT APPLY TO YOU.
          </p>
          <p className="body-text">
            <span>(b)</span>&nbsp;{" "}
            <strong>Limit on Our Liability to You.</strong> EXCEPT WHERE
            PROHIBITED BY APPLICABLE LAW, IN NO EVENT WILL COMPANY’S AGGREGATE
            LIABILITY TO YOU OR ANY THIRD PARTY IN ANY MATTER ARISING FROM OR
            RELATING TO THE PLATFORM OR THESE TERMS EXCEED THE AMOUNTS PAID BY
            YOU TO COMPANY (SPECIFICALLY EXCLUDING AMOUNTS PAID TO PROVIDERS)
            DURING THE TWELVE (12) MONTHS PRECEDING THE EVENT THAT GAVE RISE TO
            LIABILITY OR, IF YOU HAVE NOT PAID COMPANY FOR THE USE OF ANY
            SERVICES, THE AMOUNT OF $100.00 USD (OR EQUIVALENT IN LOCAL
            CURRENCY).
          </p>
          <p className="body-text">
            <span>(c)</span>&nbsp;{" "}
            <strong>No Liability for Non-Company Actions.</strong> TO THE
            MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT WILL THE
            COMPANY BE LIABLE FOR ANY DAMAGES WHATSOEVER, WHETHER DIRECT,
            INDIRECT, GENERAL, SPECIAL, COMPENSATORY, AND/OR CONSEQUENTIAL,
            ARISING OUT OF OR RELATING TO THE CONDUCT OF YOU OR ANYONE ELSE IN
            CONNECTION WITH THE PLATFORM, INCLUDING WITHOUT LIMITATION:
            <ul className="nested-list">
              <li>
                Bodily injury, death, emotional distress, and/or any other
                damages resulting from reliance on information or content posted
                on or transmitted through the platform.
              </li>
              <li>
                Any interactions with other users of the Sosh NFT Platform,
                whether online or offline.
              </li>
            </ul>
            This includes any claims, losses, or damages arising from the
            conduct of users or providers who attempt to defraud or harm you. IF
            YOU HAVE A DISPUTE WITH A PROVIDER, YOU AGREE TO RELEASE THE COMPANY
            FROM ALL CLAIMS, DEMANDS, AND DAMAGES OF EVERY NATURE, KNOWN AND
            UNKNOWN, ARISING OUT OF OR IN ANY WAY CONNECTED WITH SUCH DISPUTES.
            IN NO EVENT WILL THE COMPANY BE LIABLE FOR DIRECT OR INDIRECT
            CONSEQUENCES OF AN END USER OR PROVIDER FAILING TO COMPLY WITH
            APPLICABLE LAWS AND REGULATIONS.
          </p>
          <h3 className="page-sub-heading">18. Geographic Restrictions</h3>
          <p className="body-text">
            The Company is based in the State of New York in the United States.
            The Company makes no claims that the Sosh NFT Platform or any of
            their Content are accessible or appropriate outside of the United
            States. Access to the SOSH Platform may not be legal by certain
            persons or in certain countries. If you access the Sosh NFT Platform
            from outside the United States, you do so on your own initiative and
            are responsible for compliance with local laws.
          </p>
          <h3 className="page-sub-heading">19. Dispute Resolution</h3>
          <p className="body-text">
            PLEASE READ THIS “DISPUTE RESOLUTION” SECTION CAREFULLY. IT LIMITS
            THE WAYS YOU CAN SEEK RELIEF FROM OFFER1 AND REQUIRES YOU TO
            ARBITRATE DISPUTES ON AN INDIVIDUAL BASIS Any claim or dispute
            relating in any way to your use of the Website, or to any products
            or services sold or distributed by the Website shall be resolved by
            binding arbitration, rather than in court, except that you may
            assert claims in small claims court if your claims qualify. The
            Federal Arbitration Act and federal arbitration law apply to this
            agreement. There is no jury or judge in arbitration, and court
            review of an arbitration award is limited. However, arbitrators can
            award on an individual basis the same damages and relief as a court
            could (including declaratory and injunctive relief or statutory
            damages) and must follow the terms of these Terms of Service as a
            court would. To begin an arbitration proceeding, you must send a
            letter requesting arbitration and describing your claim to Offer1.
            The arbitration will be conducted by the American Arbitration
            Association (AAA) under its rules, including the AAA's Supplementary
            Procedures for Consumer-Related Disputes. The AAA's rules are
            available at www.adr.org or by calling 1-800-778-7879. Payment of
            all filing, administration and arbitrator fees will be governed by
            the AAA's rules. You may choose to have the arbitration conducted by
            based on written submissions, telephone or at another mutually
            agreed location. We each agree that any dispute resolution
            proceedings will be conducted only on an individual basis and not in
            a class, consolidated or representative action. If for any reason a
            claim proceeds in court rather than in arbitration we each waive any
            right to a jury trial. We also both agree that you or we may bring
            suit in court to enjoin infringement or other misuse of intellectual
            property rights.
          </p>
          <h3 className="page-sub-heading">
            20. Governing Law and Jurisdiction
          </h3>
          <p className="body-text">
            <span>(a)</span>&nbsp; All matters relating to the Website and these
            Terms of Service, and any dispute or claim arising therefrom or
            related thereto (in each case, including non-contractual disputes or
            claims), shall be governed by and construed in accordance with the
            internal laws of the State of New York without giving effect to any
            choice or conflict of law provision or rule (whether of the State of
            New York or any other jurisdiction).
          </p>
          <p className="body-text">
            <span>(b)</span>&nbsp; Subject to the binding arbitration required
            in the Dispute Resolution provision above, any legal suit, action,
            or proceeding arising out of, or related to, these Terms of Service
            or the Website shall be instituted exclusively in the federal courts
            of the United States or the courts of the State of New York, in each
            case located in the City of New York, although we retain the right
            to bring any suit, action, or proceeding against you for breach of
            these Terms of Service in your country of residence or any other
            relevant country. You waive any and all objections to the exercise
            of jurisdiction over you by such courts and to venue in such courts.
          </p>
          <h3 className="page-sub-heading">21. General Terms.</h3>
          <p className="body-text">
            <span>(a)</span>&nbsp; <strong>Reservation of Rights.</strong> Sosh
            and its licensors hold exclusive ownership over all rights, titles,
            and interests pertaining to the Sosh NFT Platform, encompassing
            associated intellectual property rights. You duly recognize that the
            Sosh NFT Platform is safeguarded by copyright, trademark, and
            various other legal statutes within the United States and
            internationally. You consent to refrain from altering, removing, or
            obscuring any copyright, trademark, service mark, or other
            proprietary notices integrated within or accompanying the Sosh NFT
            Platform.
          </p>
          <p className="body-text">
            <span>(b)</span>&nbsp; <strong>Disclosures.</strong> You recognize
            and consent to the possibility of situations arising, particularly
            in connection with your transactions on the Sosh NFT Platform, which
            could give rise to actual or potential conflicts of interest between
            your interests and those of others, including other users,
            counterparties, or Sosh. Sosh adheres to a conflicts of interest
            policy to guide its management of any such actual or potential
            conflicts. Should circumstances arise where an actual or potential
            conflict of interest between yourself and Sosh exists, Sosh will
            take appropriate measures to ensure equitable treatment for you. You
            acknowledge and accept that Sosh and its affiliates retain the
            discretion to maintain commercial ties with third parties, such as
            liquidity providers or executing dealers. These third parties may
            engage in transactions with you regarding any purchase or sale
            activities, from which Sosh and/or its affiliates may derive
            financial and other advantages.
          </p>
          <p className="body-text">
            <span>(c)</span>&nbsp; <strong>Entire Agreement.</strong> These
            Terms of Service and the Privacy Policy constitute the sole and
            entire agreement between you and Sosh, Inc., regarding the Sosh NFT
            Platform and supersede all prior and contemporaneous understandings,
            agreements, representations, and warranties, both written and oral,
            regarding the Platform.
          </p>
          <p className="body-text">
            <span>(d)</span>&nbsp; <strong>Notices.</strong> Except as otherwise
            set forth in Section 18(a), any notices or other communications
            provided by Sosh under these Terms will be given: (i) via email; or
            (ii) by posting to the Sosh NFT Platform. For notices made by email,
            the date of receipt will be deemed the date on which such notice is
            transmitted.
          </p>
          <p className="body-text">
            <span>(e)</span>&nbsp; <strong>Waiver of Rights.</strong> Sosh’s
            failure to enforce any right or provision of these Terms will not be
            considered a waiver of such right or provision. The waiver of any
            such right or provision will be effective only if in writing and
            signed by a duly authorized representative of Sosh. Except as
            expressly set forth in these Terms, the exercise by either party of
            any of its remedies under these Terms will be without prejudice to
            its other remedies under these Terms or otherwise.
          </p>
          <h3 className="page-sub-heading">22.Contact Information</h3>
          <p className="body-text">
            If you have any questions about these Terms or the Sosh NFT
            Platform, please contact Sosh at{" "}
            <a href="mailto:support@soshnft.io">support@soshnft.io</a>.
          </p>
        </div>
      </StyledUseTermsWrapper>
      {/* <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
        <Viewer fileUrl="/docs/terms&service.pdf" />;
      </Worker> */}
    </SectionWrapper>
  );
}

export default TermsOfService;
