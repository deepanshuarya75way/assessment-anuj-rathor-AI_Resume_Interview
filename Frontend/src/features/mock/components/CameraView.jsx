const CameraView = ({ videoRef }) => {
  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      style={{
        width: "200px",
        position: "fixed",
        bottom: "10px",
        right: "10px",
        borderRadius: "10px"
      }}
    />
  );
};

export default CameraView;