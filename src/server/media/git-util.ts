import * as util from 'util';
import * as childProcess from 'child_process';
import * as path from 'path';
import { Logger } from 'purple-cheetah';
import { Media } from './models/media.model';

export class GitUtil {
  private static readonly logger = new Logger('GitUtil');
  private static timer: NodeJS.Timeout;
  private static mediaBuffer: Media[] = [];

  public static init() {
    GitUtil.timer = setInterval(GitUtil.checkBuffer, 60000);
  }

  private static checkBuffer() {
    if (GitUtil.mediaBuffer.length > 0) {
      const commitMessageParts: string[] = GitUtil.mediaBuffer.map(e => {
        return e.name;
      });
      if (
        process.env.GIT_USERNAME &&
        process.env.GIT_USERNAME !== 'github-username' &&
        process.env.GIT_PASSWORD &&
        process.env.GIT_PASSWORD !== 'github-password' &&
        process.env.GIT_REPO &&
        process.env.GIT_REPO_OWNER &&
        process.env.GIT_HOST
      ) {
        util
          .promisify(childProcess.exec)(
            `git add ${path.join(
                process.env.PROJECT_ROOT,
                'uploads',
              )}/. && ` +
              `git commit -m "CMS Media, changes to: ${commitMessageParts.join(
                ', ',
              )}" && ` +
              `git push "https://${process.env.GIT_USERNAME}:${process.env.GIT_PASSWORD}@` +
              `${process.env.GIT_HOST}/${process.env.GIT_REPO_OWNER}/${process.env.GIT_REPO}"`,
          )
          .then(output => {
            GitUtil.logger.info('git-push', `Media pushed to Git repository.`);
            GitUtil.mediaBuffer = [];
          })
          .catch(e => {
            GitUtil.logger.error('git-push', e);
            GitUtil.mediaBuffer = [];
          });
      } else {
        GitUtil.logger.info('checkBuffer', `Github not setup.`);
        GitUtil.mediaBuffer = [];
      }
    }
  }

  public static push(media: Media) {
    GitUtil.mediaBuffer.push(media);
  }
}
