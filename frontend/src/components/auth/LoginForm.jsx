import {
  Alert,
  Anchor,
  Button,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const LoginForm = ({ onLogin, loading = false, error = '' }) => {
  const form = useForm({
    initialValues: {
      identifier: '',
      password: ''
    },
    validate: {
      identifier: (value) => (!value ? 'Username or email is required' : null),
      password: (value) => (!value ? 'Password is required' : null)
    }
  });

  const handleSubmit = async (values) => {
    await onLogin(values);
  };

  return (
    <Paper shadow="md" p={30} mt={30} radius="md" withBorder>

      {error && (
        <Alert icon={<AlertCircle size="1rem" />} color="red" mb="md">
          {error}
        </Alert>
      )}

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            label="Username or Email"
            placeholder="Enter your username or email"
            required
            {...form.getInputProps('identifier')}
          />

          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            required
            {...form.getInputProps('password')}
          />

          <Button type="submit" fullWidth mt="xl" loading={loading}>
            Sign In
          </Button>
        </Stack>
      </form>

      <Text c="dimmed" size="sm" ta="center" mt={30}>
        Don't have an account?{' '}
        <Anchor component={Link} to="/register" size="sm">
          Create one here
        </Anchor>
      </Text>
    </Paper>
  );
};

export default LoginForm;