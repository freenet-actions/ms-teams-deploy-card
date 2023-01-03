import {getInput, info, setFailed} from "@actions/core";
import {formatAndNotify} from "./utils";

(async function() {
  try {
    const showCardOnStart = getInput(`show-on-start`).toLowerCase() == "true";
    if (showCardOnStart) {
      await formatAndNotify("start");
    } else {
      info("Configured to not show card upon job start.");
    }
  } catch (error) {
    if (error instanceof Error) {
      setFailed(error.message);
    } else {
      setFailed(<string>error);
    }
  }
})();
