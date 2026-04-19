import { logger } from "@src/utils/logger";
import BaseJob from "../../baseJob";

export default class CheckStreamPlaylistsJob extends BaseJob<{}> {
  name = "CHECK_STREAM_PLAYLISTS_JOB";
  tags = ["worker", this.name];
  interval = "* * * * *";
  retryCount = 1;

  async handle() {
    const started = await this.services.admin.streamPlaylist.activateDuePlaylists();
    const stopped = await this.services.admin.streamPlaylist.stopExpiredPlaylists();
    if (started > 0 || stopped > 0) {
      logger.info({ tags: this.tags }, `Stream playlists: started=${started}, stopped=${stopped}`);
    }
  }
}
