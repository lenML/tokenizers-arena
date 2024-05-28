import styled from "styled-components";

import { Outlet, NavLink } from "react-router-dom";

import classNames from "classnames";
import { useEffect, useState } from "react";
import { TokenizersHub } from "./TokenizersHub";

const AppLayoutContainer = styled.div`
  display: flex;
  flex-direction: column;

  height: 100%;
  width: 100%;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  height: 32px;
  padding-left: 8px;

  white-space: nowrap;
  word-break: keep-all;
  overflow: hidden;
  text-overflow: ellipsis;

  background-color: #383838;

  user-select: none;

  .--header-item {
    height: 100%;
    display: flex;
    align-items: center;
    padding: 0 8px;

    color: white;
    text-decoration: none;

    &.--btn-like {
      &:hover {
        background-color: #424242;
      }
      &:active {
        background-color: #262626;
      }
    }

    &.--selected {
      background-color: #424242;
    }
  }

  .--bolder {
    font-weight: bold;
  }

  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
`;

const Content = styled.div`
  flex: 1;
  display: flex;

  justify-content: center;

  padding: 1rem;

  overflow: auto;
`;
const Footer = styled.div`
  display: flex;
  align-items: center;
  height: 32px;
  padding-left: 8px;

  white-space: nowrap;
  word-break: keep-all;
  overflow: hidden;
  text-overflow: ellipsis;

  background-color: #383838;
  user-select: none;

  gap: 8px;

  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;

  .--op-5 {
    opacity: 0.5;
  }
  .--red {
    color: red;
  }
`;

const Text = styled.div``;
const Emoji = styled.div``;
const HiddenDivider = styled.div`
  flex: 1;
`;
const Link = styled.a`
  text-decoration: none;
  color: white;

  &:hover {
    text-decoration: underline;
  }
`;

const useHubStatus = () => {
  const [status, setStatus] = useState({
    loaded: 0,
    downloaded: 0,
    errors: 0,
  });

  useEffect(() => {
    const handler = () => {
      setStatus(TokenizersHub.instance.get_status());
    };
    TokenizersHub.instance.events.on("change", handler);
    return () => {
      TokenizersHub.instance.events.off("change", handler);
    };
  }, []);

  return status;
};

export const AppLayout = () => {
  const status = useHubStatus();
  const header_items = [
    {
      label: "⚔️",
      type: "emoji",
    },
    {
      label: "Tokenizers Arena",
      type: "text",
      className: "--bolder",
    },
    {
      label: "Home",
      type: "nav-link",
      path: "/",
    },
    {
      label: "Direct Tokenize",
      type: "nav-link",
      path: "/direct",
    },
    {
      label: "Side By Side",
      type: "nav-link",
      path: "/side-by-side",
    },
    {
      type: "hidden-divider",
    },
    {
      type: "link",
      label: "github",
      url: "https://github.com/lenML/tokenizers",
    },
  ];
  const footer_items = [
    {
      label: `loaded: ${status.loaded}`,
      type: "text",
    },
    {
      label: `downloaded: ${status.downloaded}`,
      type: "text",
    },
    {
      label: `errors: ${status.errors}`,
      type: "text",
      className: status.errors ? "--red" : "--op-5",
    },
  ];
  return (
    <AppLayoutContainer>
      <Header>
        {header_items.map((item, index) => {
          switch (item.type) {
            case "emoji":
              return (
                <Emoji
                  className={classNames("--header-item", item.className)}
                  key={index}
                >
                  {item.label}
                </Emoji>
              );
            case "text":
              return (
                <Text
                  className={classNames("--header-item", item.className)}
                  key={index}
                >
                  {item.label}
                </Text>
              );
            case "hidden-divider":
              return <HiddenDivider key={index} />;
            case "link":
              return (
                <Link
                  className={classNames(
                    "--header-item",
                    "--btn-like",
                    item.className
                  )}
                  key={index}
                  href={item.url}
                  target="_blank"
                >
                  {item.label}
                </Link>
              );
            case "nav-link":
              return (
                <NavLink
                  className={({ isActive }) =>
                    classNames("--header-item", "--btn-like", item.className, {
                      "--selected": isActive,
                    })
                  }
                  key={index}
                  to={item.path!}
                >
                  {item.label}
                </NavLink>
              );
            default:
              return null;
          }
        })}
      </Header>
      <Content>
        <Outlet />
      </Content>
      <Footer>
        {footer_items.map((item, index) => {
          switch (item.type) {
            case "text":
              return (
                <Text key={index} className={item.className}>
                  {item.label}
                </Text>
              );
            default:
              return null;
          }
        })}
      </Footer>
    </AppLayoutContainer>
  );
};
