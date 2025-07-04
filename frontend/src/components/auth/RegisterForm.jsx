// RegisterForm.jsx
import {
  Alert,
  Anchor,
  Box,
  Button,
  Container,
  Group,
  Paper,
  PasswordInput,
  Progress,
  Stack,
  Text,
  TextInput
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { AlertCircle, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const RegisterForm = ({ onRegister, loading = false, error = '' }) => {
  const form = useForm({
    initialValues: {
      full_name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    validate: {
      full_name: (value) => (!value ? 'Full name is required' : null),
      username: (value) => {
        if (!value) return 'Username is required';
        if (value.length < 3) return 'Username must be at least 3 characters';
        return null;
      },
      email: (value) => {
        if (!value) return 'Email is required';
        return /^\S+@\S+$/.test(value) ? null : 'Invalid email';
      },
      password: (value) => {
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        return null;
      },
      confirmPassword: (value, values) => 
        value !== values.password ? 'Passwords did not match' : null
    }
  });

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const passwordStrength = getPasswordStrength(form.values.password);
  const strengthColor = passwordStrength < 50 ? 'red' : passwordStrength < 80 ? 'yellow' : 'teal';
  const strengthLabel = passwordStrength < 50 ? 'Weak' : passwordStrength < 80 ? 'Fair' : 'Strong';

  const requirements = [
    { re: /.{8,}/, label: 'At least 8 characters' },
    { re: /[0-9]/, label: 'Includes number' },
    { re: /[a-z]/, label: 'Includes lowercase letter' },
    { re: /[A-Z]/, label: 'Includes uppercase letter' },
  ];

  const checks = requirements.map((requirement, index) => (
    <Box key={index} c={requirement.re.test(form.values.password) ? 'teal' : 'red'} mt={5}>
      <Group gap={5}>
        {requirement.re.test(form.values.password) ? <Check size="0.9rem" /> : <X size="0.9rem" />}
        <Text size="sm">{requirement.label}</Text>
      </Group>
    </Box>
  ));

  const handleSubmit = async (values) => {
    const { confirmPassword, ...userData } = values;
    await onRegister(userData);
  };

  return (
    <Container size={800}>
      <Paper shadow="lg" p="xl" radius="sm" withBorder>

        {error && (
          <Alert icon={<AlertCircle size="1rem" />} color="red" mb="md">
            {error}
          </Alert>
        )}

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack spacing="md">
            <TextInput
              label="Full Name"
              placeholder="Enter your full name"
              required
              {...form.getInputProps('full_name')}
            />

            <TextInput
              label="Username"
              placeholder="Choose a username"
              required
              {...form.getInputProps('username')}
            />

            <TextInput
              label="Email"
              placeholder="Enter your email"
              required
              {...form.getInputProps('email')}
            />

            <Box>
              <PasswordInput
                label="Password"
                placeholder="Create a password"
                required
                {...form.getInputProps('password')}
              />

              {form.values.password && (
                <Box mt="xs">
                  <Progress color={strengthColor} value={passwordStrength} size={5} />
                  <Text size="xs" c="dimmed" mt={5}>
                    Password strength: {strengthLabel}
                  </Text>
                  {checks}
                </Box>
              )}
            </Box>

            <PasswordInput
              label="Confirm Password"
              placeholder="Confirm your password"
              required
              {...form.getInputProps('confirmPassword')}
            />

            <Button type="submit" fullWidth mt="xl" radius="md" variant="filled" loading={loading}>
              Create Account
            </Button>
          </Stack>
        </form>

        <Text color="gray.6" size="sm" ta="center" mt={30}>
          Already have an account?{' '}
          <Anchor component={Link} to="/login" size="sm">
            Sign in here
          </Anchor>
        </Text>
      </Paper>
    </Container>
  );
};

export default RegisterForm;
