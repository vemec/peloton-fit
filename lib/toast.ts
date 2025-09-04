import { toast } from 'sonner'

export const show = {
  success: (title: string, options?: Parameters<typeof toast.success>[1]) =>
    toast.success(title, options),
  error: (title: string, options?: Parameters<typeof toast.error>[1]) =>
    toast.error(title, options),
  info: (title: string, options?: Parameters<typeof toast.info>[1]) =>
    toast.info(title, options),
  loading: (title: string, options?: Parameters<typeof toast.loading>[1]) =>
    toast.loading(title, options),
  dismiss: (id?: Parameters<typeof toast.dismiss>[0]) => toast.dismiss(id)
}

export default show
