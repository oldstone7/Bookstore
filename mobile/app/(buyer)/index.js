// This file handles the root route of the (buyer) group
// and redirects to the storefront screen
import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/(buyer)/storefront" />;
}
