Package.describe({
  summary: "Tour guide class. Steps are triggered based on user actions rather than prev/next buttons. Uses bootstrap style tour popovers that can contain meteor templates.",
  version: "0.0.1",
  git: "https://github.com/rosh93/meteor-tourguide"
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@0.9.0.1');
  api.addFiles(['tours.js', 'tours.css'], ['client']);
  api.export('TourGuide', ['client']);
});
