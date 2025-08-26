
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useScreenSize } from "@/hooks/useScreenSize";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { History, User } from "lucide-react";
import { useCustomerHistory } from "@/hooks/use-customer-history";
import { format } from "date-fns";

interface CustomerDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title: string;
  isEditing?: boolean;
  headerActions?: React.ReactNode;
  customerId?: string; // NEW - for history tracking
}

// Customer History Component
function CustomerHistoryPanel({ customerId }: { customerId?: string }) {
  const { data: historyEntries, isLoading } = useCustomerHistory(customerId);

  if (isLoading) {
    return <div className="p-4 text-center text-muted-foreground">Loading history...</div>;
  }

  if (!historyEntries || historyEntries.length === 0) {
    return <div className="p-4 text-center text-muted-foreground">No changes recorded</div>;
  }

  return (
    <ScrollArea className="h-full max-h-96">
      <div className="space-y-4 p-4">
        {historyEntries.map((entry) => (
          <div key={entry.id} className="border rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                {entry.field_name}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {format(new Date(entry.changed_at), 'MMM dd, yyyy HH:mm')}
              </span>
            </div>
            <div className="space-y-1 text-sm">
              {entry.old_value && (
                <div>
                  <span className="text-muted-foreground">From: </span>
                  <span className="line-through text-red-600">{entry.old_value}</span>
                </div>
              )}
              {entry.new_value && (
                <div>
                  <span className="text-muted-foreground">To: </span>
                  <span className="text-green-600">{entry.new_value}</span>
                </div>
              )}
            </div>
            {entry.change_reason !== 'user_edit' && (
              <Badge variant="secondary" className="text-xs">
                {entry.change_reason}
              </Badge>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

export default function CustomerDetailsModal({
  open,
  onOpenChange,
  children,
  title,
  isEditing = false,
  headerActions,
  customerId, // NEW
}: CustomerDetailsModalProps) {
  const { isMobile } = useScreenSize();

  // Use Drawer for mobile, Dialog for desktop/tablet
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} shouldScaleBackground>
        <DrawerContent className="rounded-t-2xl p-0 bg-background animate-slide-in-right !sm:max-w-full">
          <DrawerHeader className="px-6 pb-0 pt-4 flex flex-row items-center justify-between">
            <DrawerTitle className="text-xl font-semibold">{title}</DrawerTitle>
            {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
          </DrawerHeader>
          <div className="px-4 pt-1 pb-4">
            {customerId ? (
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Details
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    History
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="mt-4">
                  {children}
                </TabsContent>
                <TabsContent value="history" className="mt-4">
                  <CustomerHistoryPanel customerId={customerId} />
                </TabsContent>
              </Tabs>
            ) : (
              children
            )}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`${
          isEditing ? "max-w-4xl" : "sm:max-w-[600px]"
        } p-0 rounded-xl w-full max-h-[80vh] flex flex-col`}
      >
        <DialogHeader className="px-6 py-4 border-b flex flex-row items-center justify-between flex-shrink-0">
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
          {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
        </DialogHeader>
        <div className={`${isEditing ? "p-8 bg-white" : "p-6"} overflow-y-auto flex-1`}>
          {customerId ? (
            <Tabs defaultValue="details" className="w-full h-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Details
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  History
                </TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="mt-4 h-full">
                {children}
              </TabsContent>
              <TabsContent value="history" className="mt-4 h-full">
                <CustomerHistoryPanel customerId={customerId} />
              </TabsContent>
            </Tabs>
          ) : (
            children
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
