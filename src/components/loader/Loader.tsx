import { useSelector } from "react-redux";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import type { RootState } from "../../store/store";

const Loader = () => {
  const { isLoading } = useSelector((state: RootState) => state.loading);

  if (!isLoading) {
    return null;
  }

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 9999,
      }}
    >
      <CircularProgress /*sx={{ color: "#E42D4E" }}*/ />
    </Box>
  );
};

export default Loader;
