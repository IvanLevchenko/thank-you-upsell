type WithOverlayProps = React.PropsWithChildren<{
  isLoading: boolean;
}>;

function WithOverlay({ children, isLoading }: WithOverlayProps) {
  return (
    <div style={{ position: "relative" }}>
      <div
        className={isLoading ? "loading" : ""}
        style={{
          position: "absolute",
          top: 0,
          left: "-2%",
          backgroundColor: "#F2F2F2",
          zIndex: 1000,
          opacity: 0,
          width: "104%",
          height: "104%",
          transition: "opacity 0.3s ease-in-out",
          visibility: "hidden",
        }}
      ></div>
      {children}
    </div>
  );
}

export default WithOverlay;
