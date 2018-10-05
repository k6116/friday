
export interface MainMenuItems {
  mainMenuItems: MainMenuItem[];
}

interface MainMenuItem {
  title: string;
  iconClass: string;
  alias: string;
  path: string;
  expanded: boolean;
  active: boolean;
  highlighted: boolean;
  permissionProtected: boolean;
  hidden: boolean;
  subItems?: SubMenuItem[];
}

interface SubMenuItem {
  title: string;
  alias: string;
  path: string;
  parentAlias: string;
  active: boolean;
  permissionProtected: boolean;
  hidden: boolean;
}
