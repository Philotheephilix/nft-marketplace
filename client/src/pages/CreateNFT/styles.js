import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme) => ({
  pageCreateNft: {
    backgroundColor: "#000",
    color: "#fff",
    minHeight: "100vh",
    padding: "2rem",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  formHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
    "& h1": {
      fontSize: "2.5rem",
      fontWeight: 700,
      color: "#fff",
    },
    "& a": {
      color: "#fff",
      transition: "color 0.2s ease",
      "&:hover": {
        color: "#fff",
      },
    },
  },
  content: {
    borderRadius: "1rem",
    padding: "2.5rem",
    width: "50rem",
    maxWidth: "700px",
  },
  dropzone: {
    marginBottom: "2rem",
  },
  fieldset: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    border: "none",
    marginTop: "1rem",
    "& label": {
      color: "#fff",
      fontWeight: 500,
    },
    "& .MuiFilledInput-root": {
      backgroundColor: "#1a1a1a",
      color: "#fff",
      transition: "border 0.2s ease, box-shadow 0.2s ease",
      "&:hover": {
        boxShadow: "0 0 0 2px rgba(98,0,234,0.3)",
      },
    },
    "& .MuiFilledInput-input": {
      padding: "1rem",
    },
    "& .MuiInputAdornment-root": {
      color: "#fff",
    },
    "& .MuiFormLabel-root": {
      color: "#fff",
    },
  },
  createButton: {
    marginTop: "2rem",
    backgroundColor: "#6200ea",
    color: "#fff",
    fontWeight: 600,
    padding: "0.75rem 1.5rem",
    borderRadius: "0.5rem",
    textTransform: "none",
    fontSize: "1rem",
    boxShadow: "0 0 10px rgba(98,0,234,0.5)",
    transition: "background-color 0.2s ease, box-shadow 0.2s ease",
    "&:hover": {
      backgroundColor: "#7b1fa2",
      boxShadow: "0 0 12px rgba(123,31,162,0.7)",
    },
  },
}));
