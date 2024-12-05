{ pkgs }: {
  deps = [
    pkgs.tree
    pkgs.rPackages.brew
    pkgs.git
    pkgs.cowsay
  ];
}