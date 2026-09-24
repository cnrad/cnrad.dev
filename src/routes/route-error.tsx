import { useRouteError, isRouteErrorResponse } from "react-router";
import { ErrorModal } from "../components/ErrorModal";
import { NotFound } from "./not-found";

/**
 * The router's errorElement: catches loader errors and errors thrown while the
 * Layout itself renders — anything that escapes PageErrorBoundary. Page-content
 * render errors are handled closer to the source (see PageErrorBoundary), so
 * this is the fallback for the rarer, layout-level failures. A thrown 404
 * response still means "not found" and gets the dedicated page.
 */
export function RouteErrorFallback() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFound />;
  }

  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : undefined;

  return <ErrorModal message={message} />;
}
