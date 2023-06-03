import { Dialog, Menu, Transition } from "@headlessui/react";
import { Link, useLocation, useNavigate, useSubmit } from "@remix-run/react";
import { Fragment, useState } from "react";

import useAuth from "~/hooks/useAuth";
import PeatedGlyph from "./assets/Glyph";
import PeatedLogo from "./assets/Logo";
import NavLink from "./navLink";
import NotificationsPanel from "./notifications/panel";
import SearchPanel from "./searchPanel";
import UserAvatar from "./userAvatar";

const HeaderLogo = () => {
  return (
    <>
      <div className="logo hidden sm:flex">
        <Link to="/">
          <PeatedLogo className="h-10 w-auto" />
        </Link>
      </div>
      <div className="logo flex sm:hidden ">
        <Link to="/">
          <PeatedGlyph className="h-8 w-auto" />
        </Link>
      </div>
    </>
  );
};

export default function AppHeader() {
  const { user } = useAuth();
  const submit = useSubmit();
  const navigate = useNavigate();
  const location = useLocation();

  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <>
      <HeaderLogo />
      <form
        className={`ml-4 flex flex-1 justify-end sm:ml-8`}
        onSubmit={(e) => {
          e.preventDefault();
          navigate(`/search?q=${encodeURIComponent(query)}`);
        }}
      >
        <input
          name="q"
          placeholder="Search for anything"
          autoComplete="off"
          className="w-full transform rounded bg-slate-900 px-2 py-1.5 text-white placeholder:text-slate-500 focus:outline focus:outline-slate-700 sm:px-3 sm:py-2"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!searchOpen) setSearchOpen(true);
          }}
          onFocus={() => {
            // not sure a better way to work around default focus
            if (!searchFocused) {
              setSearchFocused(true);
              setSearchOpen(true);
            }
          }}
        />
        <Dialog
          open={searchOpen}
          as="div"
          className="dialog"
          onClose={setSearchOpen}
        >
          <Dialog.Overlay className="fixed inset-0" />
          <Dialog.Panel className="dialog-panel">
            <SearchPanel
              onQueryChange={(value) => setQuery(value)}
              onClose={() => {
                setSearchOpen(false);
                setTimeout(() => setSearchFocused(false), 100);
              }}
            />
          </Dialog.Panel>
        </Dialog>
      </form>
      {user ? (
        <div className="ml-4 flex items-center gap-x-2 sm:ml-8">
          <div className="hidden sm:block">
            <NotificationsPanel />
          </div>
          <div className="block sm:hidden">
            <NavLink to={`/users/${user.username}`}>
              <div className="h-8 w-8 sm:h-8 sm:w-8">
                <UserAvatar user={user} />
              </div>
            </NavLink>
          </div>
          <Menu as="div" className="menu hidden sm:block">
            <Menu.Button className="focus:ring-highlight relative flex max-w-xs items-center rounded p-2 text-sm text-slate-500 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring">
              <span className="sr-only">Open user menu</span>
              <div className="h-8 w-8 sm:h-8 sm:w-8">
                <UserAvatar user={user} />
              </div>
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right">
                <Menu.Item>
                  <Link to={`/users/${user.username}`}>Profile</Link>
                </Menu.Item>
                <Menu.Item>
                  <Link to={`/friends`}>Friends</Link>
                </Menu.Item>
                <Menu.Item>
                  <Link to={`/bottles`}>Bottles</Link>
                </Menu.Item>
                <Menu.Item>
                  <Link to={`/entities`}>Brands & Distillers</Link>
                </Menu.Item>
                <Menu.Item>
                  <Link to={`/about`}>About</Link>
                </Menu.Item>
                <Menu.Item>
                  <button
                    onClick={() => {
                      submit(null, { method: "POST", action: "/logout" });
                    }}
                  >
                    Sign out
                  </button>
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      ) : (
        <div className="ml-4 flex items-center gap-x-2 sm:ml-8">
          <NavLink
            to={`/login?redirectTo=${encodeURIComponent(location.pathname)}`}
          >
            <div className="h-8 w-8 sm:h-8 sm:w-8">
              <UserAvatar />
            </div>
          </NavLink>
        </div>
      )}
    </>
  );
}