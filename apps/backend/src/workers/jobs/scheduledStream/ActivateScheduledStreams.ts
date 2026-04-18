import { logger } from "@src/utils/logger";
import BaseJob from "../../baseJob";

export default class ActivateScheduledStreamsJob extends BaseJob<{}> {
  name = "ACTIVATE_SCHEDULED_STREAMS_JOB";
  tags = ["worker", this.name];
  interval = "* * * * *"; // every minute
  retryCount = 1;

  async handle() {
    const count = await this.services.admin.scheduledStreams.activateDueStreams();
    if (count > 0) {
      logger.info({ tags: this.tags }, `Activated ${count} scheduled stream(s)`);
    }
  }
}
