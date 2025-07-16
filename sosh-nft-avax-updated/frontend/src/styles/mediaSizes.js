// media breakpoints
export const sizeNumbers = {
  mobileS: 320,
  mobile: 480,
  mobileL: 575,
  tabletS: 650,
  tablet: 768,
  tabletL: 900,
  laptopS: 991,
  laptop: 1024,
  laptopL: 1200,
  desktopS: 1260,
  desktop: 1440,
  desktopL: 1600,
};

export const size = {
  mobileS: `${sizeNumbers.mobileS}px`,
  mobile: `${sizeNumbers.mobile}px`,
  mobileL: `${sizeNumbers.mobileL}px`,
  tabletS: `${sizeNumbers.tabletS}px`,
  tablet: `${sizeNumbers.tablet}px`,
  tabletL: `${sizeNumbers.tabletL}px`,
  laptopS: `${sizeNumbers.laptopS}px`,
  laptop: `${sizeNumbers.laptop}px`,
  laptopL: `${sizeNumbers.laptopL}px`,
  desktopS: `${sizeNumbers.desktopS}px`,
  desktop: `${sizeNumbers.desktop}px`,
  desktopL: `${sizeNumbers.desktopL}px`,
};

export const deviceQuery = {
  mobileS: `(max-width: ${size.mobileS})`,
  mobile: `(max-width: ${size.mobile})`,
  mobileL: `(max-width: ${size.mobileL})`,
  tabletS: `(max-width: ${size.tabletS})`,
  tablet: `(max-width: ${size.tablet})`,
  tabletL: `(max-width: ${size.tabletL})`,
  laptopS: `(max-width: ${size.laptopS})`,
  laptop: `(max-width: ${size.laptop})`,
  laptopL: `(max-width: ${size.laptopL})`,
  desktopS: `(max-width: ${size.desktopS})`,
  desktop: `(max-width: ${size.desktop})`,
  desktopL: `(max-width: ${size.desktopL})`,
};
