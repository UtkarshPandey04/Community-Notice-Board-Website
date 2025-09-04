import { NavLink } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

export default function Sidebar({ isOpen, onOpenChange, navItems }) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Community Board</SheetTitle>
        </SheetHeader>
        <nav className="mt-8 flex flex-col space-y-4">
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={`/${item.id}`}
              className={({ isActive }) =>
                `px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'
                }`
              }
              onClick={() => onOpenChange(false)}
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  <span className="sr-only">{isActive ? ' (current page)' : ''}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}