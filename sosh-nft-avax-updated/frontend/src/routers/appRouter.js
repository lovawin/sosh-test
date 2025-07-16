import React from "react";

import { Routes as RouteSwitch, Route } from "react-router-dom";
import Routes from "constants/routes";
import TermsAndConditions from "pages/termsAndCondition/termsAndCondition";
import PrivateRoute from "./PrivateRoute";
import ErrorPage from "components/errorPage";
import ComingSoonPage from "components/ComingSoon/errorPage/comingSoon";

const Body = React.lazy(() => import("components/body/body"));

const HomePage = React.lazy(() => import("pages/homePage/homePage"));
const DetailsPage = React.lazy(() => import("pages/detailPage/detailPage"));
const ProfilePage = React.lazy(() => import("pages/myProfile/myProfile"));
const NewPost = React.lazy(() => import("pages/newPost/newPost"));
const ProfileEditPage = React.lazy(() =>
  import("pages/editProfile/editProfile")
);
const NFTCreatePage = React.lazy(() => import("pages/createNFT/createNFT"));
const DeletionPage = React.lazy(() =>
  import("pages/deletionPage/deletionPage")
);
const TermsOfServicePage = React.lazy(() =>
  import("pages/termsOfService/termsOfService")
);
const PrivacyPolicyPage = React.lazy(() =>
  import("pages/privacyPolicy/privacyPolicy")
);
const DisclaimerPage = React.lazy(() => import("pages/disclaimer/disclaimer"));
const AboutPage = React.lazy(() => import("pages/about/about"));
const LandingPage = React.lazy(() => import("pages/landingPage/landingPage"));

function AppRouter() {
  return (
    <RouteSwitch>
      <Route exact path={Routes.home} element={<HomePage />}></Route>
      <Route
        exact
        path={Routes.profile}
        element={
          <PrivateRoute>
            {/* <LandingPage /> */}
            <ProfilePage follow={false} />
          </PrivateRoute>
        }
      ></Route>

      <Route
        exact
        path={Routes.landing}
        element={
          // <PrivateRoute>
          <LandingPage />
          // <ProfilePage follow={false} />
          // </PrivateRoute>
        }
      ></Route>
      <Route
        exact
        path={Routes.userProfile + "/:id"}
        element={<ProfilePage follow={true} />}
      ></Route>
      <Route
        exact
        path={Routes.termsOfService}
        element={<TermsOfServicePage />}
      ></Route>
      <Route
        exact
        path={Routes.termsandcodition}
        element={<TermsAndConditions />}
      ></Route>
      <Route
        exact
        path={Routes.privacyPolicy}
        element={<PrivacyPolicyPage />}
      ></Route>
      <Route exact path={Routes.disclaimer} element={<DisclaimerPage />} />
      <Route exact path={Routes.about} element={<AboutPage />} />
      <Route
        exact
        path={Routes.deletionDetails}
        element={<DeletionPage />}
      ></Route>
      <Route
        exact
        path={Routes.editProfile}
        element={
          <PrivateRoute>
            <ProfileEditPage />
          </PrivateRoute>
        }
      ></Route>
      <Route
        exact
        path={Routes.createNFT}
        element={
          <PrivateRoute>
            <NFTCreatePage />
          </PrivateRoute>
        }
      />
      <Route exact path="/home" element={<Body />}></Route>
      <Route
        exact
        path={Routes.newPost}
        element={
          <PrivateRoute>
            <NewPost />
          </PrivateRoute>
        }
      />
      <Route
        exact
        path={Routes.nftDetail + "/:id"}
        element={<DetailsPage />}
      ></Route>
      <Route
        path="*"
        element={<ErrorPage containerClass="page-not-found" showAction />}
      />
       <Route
        path="/coming-soon"
        element={<ComingSoonPage containerClass="page-not-found" showAction />}
      />
    </RouteSwitch>
  );
}

export default AppRouter;
