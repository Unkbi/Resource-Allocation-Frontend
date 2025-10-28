import { RootState } from '@/app/redux/store';
import { useSelector } from 'react-redux';

export type InjectedProps = {
  permissions: Record<string, CrudPermissions>;
  loadingPermissions: boolean;
};

export type CrudPermissions = {
  c: boolean;
  r: boolean;
  u: boolean;
  d: boolean;
};

export function withRBAC<P extends object>(
  WrappedComponent: React.ComponentType<
    P & { permissions: Record<string, CrudPermissions> }
  >,
  resourceNames: string[]
) {
  return function RBACWrapper(props: P) {
    const { loginUserPrivileges, loadingLoginUserPrivileges } = useSelector(
      (state: RootState) => state.rbac
    );

    // Build a permissions object for each resource
    const permissions = resourceNames.reduce(
      (acc, resource) => {
        acc[resource] = loginUserPrivileges?.[resource] || {
          c: false,
          r: false,
          u: false,
          d: false,
        };
        return acc;
      },
      {} as Record<string, CrudPermissions>
    );

    return (
      <WrappedComponent
        {...props}
        permissions={permissions}
        loadingPermissions={loadingLoginUserPrivileges}
      />
    );
  };
}
