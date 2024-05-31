import { invoke } from "@tauri-apps/api/core";

/**
 * Specifies the state of the machine for the current user in relation to the propriety of sending a notification.
 * @link https://learn.microsoft.com/en-us/windows/win32/api/shellapi/ne-shellapi-query_user_notification_state
 */
export enum UserNotificationState {
  /**
   * A screen saver is displayed, the machine is locked, or a nonactive Fast User Switching session is in progress.
   */
  NotPresent = 1,

  /**
   * A full-screen application is running or Presentation Settings are applied. Presentation Settings allow a user to put their machine into a state fit for an uninterrupted presentation, such as a set of PowerPoint slides, with a single click.
   */
  Busy = 2,

  /**
   * A full-screen (exclusive mode) Direct3D application is running.
   */
  RunningD3DFullScreen = 3,

  /**
   * The user has activated Windows presentation settings to block notifications and pop-up messages.
   */
  PresentationMode = 4,

  /**
   * None of the other states are found, notifications can be freely sent.
   */
  AcceptsNotifications = 5,

  /**
   * **Introduced in Windows 7.** The current user is in "quiet time", which is the first hour after a new user logs into his or her account for the first time. During this time, most notifications should not be sent or shown. This lets a user become accustomed to a new computer system without those distractions. Quiet time also occurs for each user after an operating system upgrade or clean installation.
   */
  QuietTime = 6,

  /**
   * **Introduced in Windows 8.** A Windows Store app is running.
   */
  App = 7,
}

export async function checkNotificationState(): Promise<UserNotificationState> {
  return await invoke<UserNotificationState>("check_notification_state");
}