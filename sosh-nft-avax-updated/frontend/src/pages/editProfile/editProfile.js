import React from "react";
import { Main } from "./style";
import EditProfileUI from "../../components/editProfile/editProfile";
import Notification from "../../components/notification/notification";
import { Nav, Tab } from "react-bootstrap";
import SectionWrapper from "components/sectionWrapper";

const TABS_DATA = {
  edit: {
    title: "Edit Profile",
    key: "edit",
  },
  // profile: {
  //   title: "Profile Verification",
  //   key: "profile",
  // },
  notification: {
    title: "Notification",
    key: "notification",
  },
};

const TABS_DATA_ARRAY = Object.values(TABS_DATA);

function EditProfile() {
  return (
    <SectionWrapper>
      <Main>
        <Tab.Container defaultActiveKey={TABS_DATA?.edit.key}>
          <Nav className="tab-list">
            {TABS_DATA_ARRAY?.map(({ title, key, type, icon: Icon }) => {
              return (
                <Nav.Item className="tab-item">
                  <Nav.Link className="tab-link" eventKey={key}>
                    {title} {Icon && <Icon />}
                  </Nav.Link>
                </Nav.Item>
              );
            })}
          </Nav>

          <Tab.Content>
            <Tab.Pane eventKey={TABS_DATA?.edit.key}>
              <EditProfileUI />
            </Tab.Pane>
            {/* <Tab.Pane eventKey={TABS_DATA?.profile.key}>
              <ProfileVerification />
            </Tab.Pane> */}
            <Tab.Pane eventKey={TABS_DATA?.notification.key}>
              <Notification />
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Main>
    </SectionWrapper>
  );
}

export default EditProfile;
