const CracoLessPlugin = require('craco-less');
const path = require('path');
const fs = require('fs-extra');

module.exports = {
  babel: {
    loaderOptions: {
      // this option lets us display the map-pin marker layer - without this it does not work: https://github.com/visgl/react-map-gl/issues/1266
      ignore: ['./node_modules/mapbox-gl/dist/mapbox-gl.js'],
    },
  },
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: {
              '@primary-color': '#9155fd',
              '@layout-sider-menu-container': '#ECE8FD',
              '@component-background': '#FFFFFF',
              '@layout-header-background': '#ECE8FD',
              '@layout-body-background': '#ECE8FD',
            },
            javascriptEnabled: true,
          },
        },
      },
    },
    {
      plugin: {
        overrideWebpackConfig: ({ webpackConfig }) => {

          // Copying locale files from carbon-library dist in the node_modules folder to public folder  
          const localeSrcDir = path.resolve(__dirname, 'node_modules/@undp/carbon-library/dist/locales');
          const localeDestDir = path.resolve(__dirname, 'public/locales');

          // Ensure the destination directory exists, then copy the files
          if (fs.existsSync(localeSrcDir)) {
            fs.ensureDirSync(localeDestDir);
            fs.copySync(localeSrcDir, localeDestDir);
          }
          return webpackConfig;
        }
      }
    }
  ],
};
