Package.describe({
  summary: "Tour guide class built around meteor templates and reactivity.",
  version: "0.0.5",
  git: "https://github.com/rosh93/meteor-tourguide"
});

Package.onUse(function(api) {
  api.use('reactive-var');
  api.versionsFrom('METEOR@0.9.2.2');
  api.addFiles(['tours.js', 'tours.css'], ['client']);
  api.export('TourGuide', ['client']);
});
