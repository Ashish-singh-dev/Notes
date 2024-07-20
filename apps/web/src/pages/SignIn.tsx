import LockIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import {
  Avatar,
  Backdrop,
  Box,
  Button,
  Container,
  Grid,
  IconButton,
  Link,
  TextField,
  Typography
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

import FormDialog from "@/components/FormDialog";
import { SESSION_TOKEN_KEY } from "@/constant/auth";
import { APIError } from "@/lib/api-error";
import { fetchAPI } from "@/lib/fetch-wrapper";
import { useAuthStore } from "@/store/auth";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
interface State {
  email: string;
  password: string;
  showPassword: boolean;
}

export default function SignIn() {
  const [values, setValues] = useState<State>({
    email: "",
    password: "",
    showPassword: false
  });
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isResetFormOpen, setIsResetFormOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  // check for user
  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user]);

  const handleChange =
    (prop: keyof State) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues({ ...values, [prop]: event.target.value });
    };

  const handleClickShowPassword = () => {
    setValues({
      ...values,
      showPassword: !values.showPassword
    });
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    const email = values.email;
    const password = values.password;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = await fetchAPI.post("/v1/auth/login", {
        data: {
          email,
          password
        },
        // auto abort in 2 minutes
        options: { signal: AbortSignal.timeout(1000 * 60 * 2) }
      });

      if (
        !data?.sessionToken ||
        !data.id ||
        !data.email ||
        typeof data.emailVerified !== "boolean"
      ) {
        throw new Error("Invalid Session");
      }

      localStorage.setItem(SESSION_TOKEN_KEY, data.sessionToken);

      setUser({
        id: data.id,
        email: data.email,
        emailVerified: data.emailVerified
      });
    } catch (error: unknown) {
      if (error instanceof APIError) return toast.error(error.message);
      if (error instanceof Error) return toast.error(error.message);

      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: "16px"
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockIcon />
          </Avatar>
          <Typography
            component="h1"
            variant="h5"
            sx={{ color: "text.primary" }}
          >
            Sign in
          </Typography>
          <Box
            component="form"
            sx={{ mt: 1 }}
            noValidate
            id="login-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <TextField
              value={values.email}
              onChange={handleChange("email")}
              margin="normal"
              id="email"
              required
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              autoComplete="email"
              autoFocus
            />
            <TextField
              value={values.password}
              onChange={handleChange("password")}
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={values.showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {values.showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 2 }}
              type="submit"
              form="login-form"
            >
              Sign In
            </Button>
            <Grid container sx={{ mt: 2 }}>
              <Grid item xs>
                <Link
                  variant="body2"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsResetFormOpen(true);
                  }}
                  sx={{ cursor: "pointer" }}
                >
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link href="/signup" variant="body2">
                  Don&apos;t have an account? Sign Up
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
      <FormDialog
        isOpen={isResetFormOpen}
        setOpen={setIsResetFormOpen}
        title="Reset Password"
        content="To reset your password, please enter your email address here. We will send you reset link on your mail."
        positiveButtonLabel="Send"
        textFieldLabel="Email Address"
        textFieldType="email"
        positiveButtonAction={async (email, setLoadingToFalse) => {
          if (!email || !emailRegex.test(email)) {
            toast.error("Invalid email");
            setLoadingToFalse();
            return;
          }
          await fetchAPI.post("/v1/auth/reset-password", {
            data: { email },
            responseType: "text"
          });
          setLoadingToFalse();
          setIsResetFormOpen(false);
          toast.success(
            "Reset link sent to your email, please check your inbox, spam or junk folder.",
            { duration: 7 * 1000 }
          );
        }}
      />
      <Backdrop
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
}
