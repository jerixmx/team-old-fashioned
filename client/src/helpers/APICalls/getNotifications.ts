import { FetchOptions } from '../../interface/FetchOptions';
import { NotificationsList } from '../../interface/Notifications';

export async function getNotifications(): Promise<NotificationsList> {
  const fetchOptions: FetchOptions = {
    method: 'GET',
    credentials: 'include',
  };
  return await fetch(`/notifications`, fetchOptions)
    .then((res) => {
      console.log(res.json());
      return res.json();
    })
    .catch(() => ({
      error: { message: 'Unable to connect to server. Please try again' },
    }));
}
