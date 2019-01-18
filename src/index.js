require = require("esm")(module); // eslint-disable-line no-global-assign
const handle = require("./payloadHandler").handle;
const localPayload = require("./payloadHandler").localPayload;

const trackPii = async (request, response) => {
  await handle(request);
  response.status(200).send("Processed deployment.");
};

// used for local testing
(async () => {
  const argv = require("minimist")(process.argv.slice(2));
  const { pr } = argv;

  if (pr) {
    const result = await localPayload();
    console.log(result);
  }
})();

module.exports.trackPii = trackPii;