const CracoLessPlugin = require('craco-less');

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
  ],
};
