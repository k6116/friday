
export class MainMenuItems {
  mainMenuItem: MainMenuItem[];
}

export class MainMenuItem {
  title: string;
  iconClass: string;
  alias: string;
  path: string;
  expanded: boolean;
  active: boolean;
  highlighted: boolean;
  subItems?: SubMenuItems[];
}

export class SubMenuItems {
  title: string;
  alias: string;
  path: string;
  parentAlias: string;
  active: boolean;
}
