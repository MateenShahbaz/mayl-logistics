import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Link, useLocation } from "react-router"; // <- react-router-dom!

import {
  CalenderIcon,
  CheckLineIcon,
  ChevronDownIcon,
  FileIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  UserCircleIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  { icon: <GridIcon />, name: "Dashboard", path: "/" },
  {
    icon: <CalenderIcon />,
    name: "Orders",
    subItems: [
      { name: "Create Orders", path: "/orders", pro: false },
      { name: "Bulk Booking", path: "/bulk-booking", pro: false },
      { name: "Order Logs", path: "/order-log", pro: false },
      { name: "Airway Bills", path: "/airway-bills", pro: false },
      { name: "Generate Load Sheet", path: "/load-sheet", pro: false },
      { name: "Load Sheet Logs", path: "/log-sheet", pro: false },
    ],
  },
  {
    icon: <ListIcon />,
    name: "Payments",
    subItems: [
      { name: "Cash Payment Reciept (CPR)", path: "/cash-payment", pro: false },
      { name: "Transaction Log", path: "/transaction-log", pro: false },
    ],
  },
  {
    icon: <CheckLineIcon />,
    name: "Profiles",
    subItems: [
      { name: "Verified", path: "/verified", pro: false },
      { name: "Unverified", path: "/unverified", pro: false },
    ],
  },
  {
    icon: <FileIcon />,
    name: "Mayl logistics Calc",
    subItems: [
      { name: "Shippment Arrives", path: "/shippment-arrives", pro: false },
      { name: "Utilities", path: "/utilities", pro: false },
    ],
  },
  { icon: <UserCircleIcon />, name: "User Profile", path: "/profile" },
];

const othersItems: NavItem[] = [];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const { user } = useAuth();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  const filteredNavItems = useMemo<NavItem[]>(() => {
    return navItems
      .map((item) => {
        // SHIPPER: show everything except the "Profiles" and "Mayl logistics Calc"
        if (user?.role === "Shipper") {
          if (item.name === "Profiles" || item.name === "Mayl logistics Calc")
            return null;
          return item;
        }

        // ADMIN: keep Orders (only Create Orders + Airway Bills), Profiles, User Profile, and Mayl logistics Calc
        if (user?.role === "Admin") {
          if (item.name === "Orders") {
            return {
              ...item,
              subItems: item.subItems?.filter(
                (s) => s.name === "Create Orders" || s.name === "Airway Bills"
              ),
            };
          }
          if (
            item.name === "Profiles" ||
            item.name === "User Profile" ||
            item.name === "Mayl logistics Calc"
          ) {
            return item;
          }
          return null;
        }

        // default: all items
        return item;
      })
      .filter((i): i is NavItem => i !== null);
  }, [user?.role]);

  // helper to check if any subitem of a nav is active
  const isAnySubActive = useCallback(
    (nav: NavItem) => !!nav.subItems?.some((s) => isActive(s.path)),
    [isActive]
  );

  // Open the submenu that contains the active route (using filteredNavItems)
  useEffect(() => {
    let submenuMatched = false;

    // main menus
    filteredNavItems.forEach((nav, index) => {
      if (nav.subItems && isAnySubActive(nav)) {
        setOpenSubmenu({ type: "main", index });
        submenuMatched = true;
      }
    });

    // others (if any)
    othersItems.forEach((nav, index) => {
      if (nav.subItems && nav.subItems.some((s) => isActive(s.path))) {
        setOpenSubmenu({ type: "others", index });
        submenuMatched = true;
      }
    });

    if (!submenuMatched) setOpenSubmenu(null);
  }, [location.pathname, filteredNavItems, isAnySubActive, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prev) => ({
          ...prev,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prev) => {
      if (prev && prev.type === menuType && prev.index === index) return null;
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => {
        const parentActive = isAnySubActive(nav);
        const isOpen =
          openSubmenu?.type === menuType && openSubmenu?.index === index;

        return (
          <li key={nav.name}>
            {nav.subItems ? (
              <button
                onClick={() => handleSubmenuToggle(index, menuType)}
                className={`menu-item group ${
                  isOpen ? "menu-item-active" : "menu-item-inactive"
                } cursor-pointer ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "lg:justify-start"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isOpen || parentActive
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>

                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}

                {(isExpanded || isHovered || isMobileOpen) && (
                  <ChevronDownIcon
                    className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-brand-500" : ""
                    }`}
                  />
                )}
              </button>
            ) : (
              nav.path && (
                <Link
                  to={nav.path}
                  className={`menu-item group ${
                    isActive(nav.path)
                      ? "menu-item-active"
                      : "menu-item-inactive"
                  }`}
                >
                  <span
                    className={`menu-item-icon-size ${
                      isActive(nav.path)
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                </Link>
              )
            )}

            {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
              <div
                ref={(el) => {
                  subMenuRefs.current[`${menuType}-${index}`] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height: isOpen
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
                }}
              >
                <ul className="mt-2 space-y-1 ml-9">
                  {nav.subItems.map((subItem) => (
                    <li key={subItem.name}>
                      <Link
                        to={subItem.path}
                        className={`menu-dropdown-item ${
                          isActive(subItem.path)
                            ? "menu-dropdown-item-active"
                            : "menu-dropdown-item-inactive"
                        }`}
                        onClick={() => {
                          // keep the current submenu open for UX consistency
                          setOpenSubmenu({ type: menuType, index });
                        }}
                      >
                        {subItem.name}
                        <span className="flex items-center gap-1 ml-auto">
                          {subItem.new && (
                            <span
                              className={`ml-auto ${
                                isActive(subItem.path)
                                  ? "menu-dropdown-badge-active"
                                  : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                            >
                              new
                            </span>
                          )}
                          {subItem.pro && (
                            <span
                              className={`ml-auto ${
                                isActive(subItem.path)
                                  ? "menu-dropdown-badge-active"
                                  : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                            >
                              pro
                            </span>
                          )}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 ${
        isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
          ? "w-[290px]"
          : "w-[90px]"
      } ${
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-center"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="./images/logo/web-logo.png"
                alt="Logo"
                width={170}
                height={20}
              />
              <img
                className="hidden dark:block"
                src="./images/logo/web-logo.png"
                alt="Logo"
                width={170}
                height={20}
              />
            </>
          ) : (
            <img
              src="./images/logo/web-logo.png"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(filteredNavItems, "main")}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
