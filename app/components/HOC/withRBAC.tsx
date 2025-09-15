import { RootState } from '@/app/redux/store';
import { useSelector } from 'react-redux';

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
    const loginUserPrivileges = useSelector(
      (state: RootState) => state.rbac.loginUserPrivileges
    );

    // Build a permissions object for each resource
    const permissions = resourceNames.reduce(
      (acc, resource) => {
        //Sahadev : Added for testing 
        if(resource =='Portfolio'){
          acc[resource] = {
             c: true,
             r: true,
             u: false,
             d: false,
          }
        }else if(resource =='Allocation'){
          acc[resource] = {
             c: false,
             r: true,
             u: false,
             d: false,
          }
        }
        else{
         acc[resource] = loginUserPrivileges?.[resource] || {
          c: true,
          r: true,
          u: true,
          d: true,
        };
      }
        //Sahadev : Main code
        // acc[resource] = loginUserPrivileges?.[resource] || {
        //   c: true,
        //   r: true,
        //   u: true,
        //   d: true,
        // };
        return acc;
      },
      {} as Record<string, CrudPermissions>
    );

    return <WrappedComponent {...props} permissions={permissions} />;
  };
}
