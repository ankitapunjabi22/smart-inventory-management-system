import { useAppSelector } from '../redux/hooks'

export const useAuth = () => {
  const { user, isAuthenticated, isLoading } = useAppSelector(state => state.auth)
  return { user, isAuthenticated, isLoading }
}
