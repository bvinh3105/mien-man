"use client";

import React, { useState } from 'react';
import Link from 'next/link';
// import AdminGuard from '@/components/AdminGuard'; // TODO: bật lại khi deploy
import {
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import GitProgressTracker, { type ProgressStep } from '@/components/GitProgressTracker';

// --- HELPER: Tạo steps cho GitProgressTracker dựa trên trạng thái đơn hàng ---
function buildOrderSteps(order: typeof INITIAL_ORDERS[number]): ProgressStep[] {
  const steps: ProgressStep[] = [
    { id: 'created', status: 'delivered', title: 'Tạo đơn hàng', description: `Khách ${order.name} đặt đơn — ${order.items}`, timestamp: '27/08/2026 14:30', branchType: 'none' },
    { id: 'confirmed', status: 'delivered', title: 'Xác nhận đơn', description: 'Đã kiểm duyệt nội dung thêu, xác nhận thanh toán.', timestamp: '27/08/2026 15:00', branchType: 'none' },
  ];

  if (order.status === 'pending') {
    steps[1] = { ...steps[1], status: 'working', title: 'Chờ xử lý', description: 'Đơn hàng đang chờ admin xác nhận và phân công sản xuất.', timestamp: order.time };
    steps.push(
      { id: 'produce', status: 'empty', title: 'Sản xuất', description: 'Chờ phân công máy thêu & thợ.', branchType: 'none' },
      { id: 'qc', status: 'empty', title: 'Kiểm tra chất lượng', description: 'Chờ bước trước hoàn thành.', branchType: 'none' },
      { id: 'ship', status: 'empty', title: 'Giao hàng', description: 'Chờ đóng gói & bàn giao vận chuyển.', branchType: 'none' },
    );
  } else if (order.status === 'producing') {
    steps.push(
      { id: 'produce', status: 'working', title: 'Đang sản xuất', description: `Phân công ${order.machine || 'Máy thêu'}. Tiến độ ${order.progress || 0}%.`, timestamp: order.time, branchType: 'none' },
      { id: 'qc', status: 'empty', title: 'Kiểm tra chất lượng', description: 'Chờ sản xuất xong để kiểm tra.', branchType: 'none' },
      { id: 'ship', status: 'empty', title: 'Giao hàng', description: 'Chờ đóng gói & bàn giao vận chuyển.', branchType: 'none' },
    );
  } else if (order.status === 'issue') {
    steps.push(
      { id: 'produce', status: 'working', title: 'Đang sản xuất', description: `Phân công sản xuất.`, timestamp: '27/08/2026 16:00', branchType: 'none' },
      { id: 'issue', status: 'paused', title: 'Tạm dừng — Vấn đề', description: order.note || 'Phát hiện lỗi trong quá trình sản xuất.', timestamp: order.time, branchType: 'issue' },
      { id: 'qc', status: 'empty', title: 'Kiểm tra chất lượng', description: 'Chờ giải quyết vấn đề.', branchType: 'none' },
      { id: 'ship', status: 'empty', title: 'Giao hàng', description: 'Chờ đóng gói & bàn giao vận chuyển.', branchType: 'none' },
    );
  }

  return steps;
}

// --- MOCK DATA ---
const STAFF = [
  { name: 'Chị Lan', role: 'Thợ thêu chính', phone: '0901 234 567', avatar: 'CL', color: 'bg-emerald-100 text-emerald-700' },
  { name: 'Anh Đức', role: 'Thợ thêu', phone: '0912 345 678', avatar: 'AĐ', color: 'bg-sky-100 text-sky-700' },
  { name: 'Chị Mai', role: 'QC / Đóng gói', phone: '0923 456 789', avatar: 'CM', color: 'bg-amber-100 text-amber-700' },
];

const INITIAL_ORDERS = [
  { id: 'MM-0042', status: 'pending', color: 'gray', name: 'Khánh Huyền', price: '700.000đ', paymentMethod: 'COD', time: '2 phút trước', items: 'Túi Tote Hoa Cúc (x2)', avatar: 'KH', assignee: null as typeof STAFF[number] | null },
  { id: 'MM-0043', status: 'pending', color: 'gray', name: 'An Nguyễn', price: '250.000đ', paymentMethod: 'MOMO', time: '1 giờ trước', items: 'Mũ Bucket Custom', avatar: 'AN', urgent: true, assignee: null as typeof STAFF[number] | null },
  { id: 'MM-0038', status: 'producing', color: 'blue', name: 'Thảo Lê', price: '1.200.000đ', paymentMethod: 'VNPAY', time: 'Hôm qua', items: 'Vỏ gối Linen (x5)', avatar: 'TL', progress: 60, machine: 'Máy #02', assignee: STAFF[0] },
  { id: 'MM-0040', status: 'issue', color: 'purple', name: 'Bảo Trần', price: '350.000đ', paymentMethod: 'COD', time: '2 ngày trước', items: 'Túi Canvas Custom', avatar: 'BT', note: 'Hết chỉ đỏ mã #42R', assignee: STAFF[1] },
];

// --- LỊCH SỬ ĐƠN HÀNG (đã hoàn thành / hủy / hoàn) ---
const ORDER_HISTORY = [
  { id: 'MM-0035', status: 'delivered', name: 'Minh Tú', items: 'Túi Tote Canvas (x1)', price: '350.000đ', paymentMethod: 'MOMO', avatar: 'MT', assignee: STAFF[0], completedAt: '25/08/2026', orderedAt: '20/08/2026', deliveryDays: 5, rating: 5 },
  { id: 'MM-0033', status: 'delivered', name: 'Hà Phương', items: 'Áo Phông Thêu Logo (x3)', price: '1.350.000đ', paymentMethod: 'VNPAY', avatar: 'HP', assignee: STAFF[1], completedAt: '24/08/2026', orderedAt: '18/08/2026', deliveryDays: 6, rating: 4 },
  { id: 'MM-0031', status: 'delivered', name: 'Đức Anh', items: 'Mũ Bucket Custom', price: '250.000đ', paymentMethod: 'COD', avatar: 'ĐA', assignee: STAFF[0], completedAt: '22/08/2026', orderedAt: '17/08/2026', deliveryDays: 5, rating: 5 },
  { id: 'MM-0029', status: 'cancelled', name: 'Thu Hằng', items: 'Vỏ gối Linen (x2)', price: '480.000đ', paymentMethod: 'MOMO', avatar: 'TH', assignee: null, cancelledAt: '21/08/2026', orderedAt: '21/08/2026', reason: 'Khách đổi ý, hủy trước khi sản xuất' },
  { id: 'MM-0027', status: 'refunded', name: 'Quốc Bảo', items: 'Túi Canvas Custom', price: '320.000đ', paymentMethod: 'VNPAY', avatar: 'QB', assignee: STAFF[1], refundedAt: '19/08/2026', orderedAt: '12/08/2026', reason: 'Lỗi thêu sai font chữ, hoàn tiền 100%' },
  { id: 'MM-0025', status: 'delivered', name: 'Ngọc Trinh', items: 'Túi Tote Hoa Hồng (x1)', price: '380.000đ', paymentMethod: 'COD', avatar: 'NT', assignee: STAFF[2], completedAt: '18/08/2026', orderedAt: '13/08/2026', deliveryDays: 5, rating: 5 },
  { id: 'MM-0022', status: 'delivered', name: 'Văn Hùng', items: 'Áo Polo Thêu Tên (x5)', price: '2.250.000đ', paymentMethod: 'VNPAY', avatar: 'VH', assignee: STAFF[0], completedAt: '15/08/2026', orderedAt: '08/08/2026', deliveryDays: 7, rating: 4 },
  { id: 'MM-0019', status: 'cancelled', name: 'Yến Nhi', items: 'Khăn Thêu Custom', price: '150.000đ', paymentMethod: 'COD', avatar: 'YN', assignee: null, cancelledAt: '10/08/2026', orderedAt: '10/08/2026', reason: 'Không liên lạc được khách sau 48h' },
];

// Retention: giữ 60 ngày trong DB, sau đó archive → Excel
const RETENTION_DAYS = 60;
const ARCHIVE_POLICY = {
  keepInDb: RETENTION_DAYS,
  autoExportFormat: 'xlsx',
  exportFolder: 'Google Drive > Miên Man > Archive > Orders',
  schedule: 'Tự động chạy đầu mỗi tháng (1st)',
  includes: ['Đơn hàng', 'Lịch sử trạng thái', 'Thanh toán', 'Thông tin khách'],
};

const MOCK_PRODUCTS = [
  { name: 'Túi Tote Hoa Cúc', cost: '150.000đ', originalPrice: '350.000đ', discount: '10%', finalPrice: '315.000đ', stock: 0, alert: true, avatar: 'T' },
  { name: 'Mũ Bucket Custom', cost: '120.000đ', originalPrice: '250.000đ', discount: null, finalPrice: '250.000đ', stock: 45, alert: false, avatar: 'M' },
];

const MOCK_CUSTOMERS = [
  { name: 'Khánh Huyền', email: 'khanhhuyen.design@gmail.com', phone: '0987 654 321', orders: 4, spent: '2.150.000đ', vip: true, avatar: 'KH' },
  { name: 'An Nguyễn', email: 'an.nguyen99@gmail.com', phone: '0345 123 999', orders: 1, spent: '250.000đ', vip: false, avatar: 'AN' },
];

const COLUMNS = [
  { id: 'pending', title: 'Chờ xử lý', colorClass: 'bg-gray-400', badgeClass: 'bg-gray-300/50 text-gray-600', containerClass: 'bg-gray-200' },
  { id: 'producing', title: 'Đang sản xuất', colorClass: 'bg-blue-500 animate-pulse', badgeClass: 'bg-gray-300/50 text-gray-600', containerClass: 'bg-gray-200', borderTop: 'border-t-4 border-t-blue-500' },
  { id: 'issue', title: 'Tạm dừng', colorClass: 'bg-purple-500', badgeClass: 'bg-purple-200 text-purple-800', containerClass: 'bg-purple-50', borderTop: 'border-t-4 border-t-purple-500 bg-purple-50', titleColor: 'text-purple-900' }
];

// --- SORTABLE ITEM COMPONENT ---
function SortableOrderCard({ order, onClick, isOverlay }: { order: any, onClick?: () => void, isOverlay?: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: order.id, data: { type: 'Order', order } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const badgeColor = order.paymentMethod === 'MOMO' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700';

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      onClick={onClick}
      className={`bg-white rounded-lg p-4 shadow-sm cursor-grab border border-transparent hover:shadow-md hover:border-gray-300 transition-all ${order.status === 'issue' ? 'border-l-4 border-l-purple-500' : ''} ${isOverlay ? 'shadow-xl rotate-2 cursor-grabbing' : ''}`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm font-bold text-gray-900">{order.id}</span>
        {order.status === 'issue' ? (
           <span className="text-[10px] text-white bg-purple-500 px-1.5 py-0.5 rounded uppercase font-bold">Hold</span>
        ) : order.urgent ? (
          <span className="text-xs text-red-500 font-medium">⚠ Trễ</span>
        ) : (
          <span className="text-xs text-gray-500">{order.time}</span>
        )}
      </div>
      
      <h3 className="font-medium text-gray-800 text-sm mb-2">{order.items}</h3>
      
      {order.status === 'issue' && order.note && (
        <p className="text-xs text-gray-500 mb-2 border-l-2 border-gray-200 pl-2 italic">{order.note}</p>
      )}
      
      {order.status === 'producing' && order.progress && (
        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
          <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${order.progress}%` }}></div>
        </div>
      )}

      {order.urgent && order.status !== 'issue' && (
        <div className="bg-red-50 text-red-700 text-xs p-1.5 rounded mb-3 mt-1 border border-red-100">Cần gấp thứ 7</div>
      )}
      
      {/* Assignee badge (admin only) */}
      {order.assignee && (
        <div className="flex items-center gap-2 mt-2 p-1.5 bg-gray-50 rounded border border-gray-100">
          <div className={`w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold ${order.assignee.color}`}>{order.assignee.avatar}</div>
          <span className="text-[11px] font-medium text-gray-600">{order.assignee.name}</span>
          <span className="text-[9px] text-gray-400 ml-auto">{order.assignee.role}</span>
        </div>
      )}
      {!order.assignee && (
        <div className="flex items-center gap-1.5 mt-2 p-1.5 bg-yellow-50 rounded border border-yellow-100 border-dashed">
          <span className="text-[11px] text-yellow-600 font-medium">⚡ Chưa phân công</span>
        </div>
      )}

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          {order.status !== 'issue' && <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${badgeColor}`}>{order.avatar}</div>}
          {order.status === 'producing' && order.machine && <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{order.machine}</span>}
        </div>
        {order.status !== 'issue' && <span className="text-xs font-bold text-gray-900">{order.price}</span>}
      </div>
    </div>
  );
}


// TODO: bật lại AdminGuard khi deploy
// export default function AdminPage() {
//   return (
//     <AdminGuard>
//       <AdminDashboard />
//     </AdminGuard>
//   );
// }

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'customers' | 'history'>('orders');
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'delivered' | 'cancelled' | 'refunded'>('all');
  const [showArchiveInfo, setShowArchiveInfo] = useState(false);

  // Modal states
  const [orderModal, setOrderModal] = useState<any>(null);
  const [productModal, setProductModal] = useState<any>(null);
  const [customerModal, setCustomerModal] = useState<any>(null);

  const closeAllModals = () => {
    setOrderModal(null);
    setProductModal(null);
    setCustomerModal(null);
  };

  const hasAnyModalOpen = !!orderModal || !!productModal || !!customerModal;

  // --- DND KIT LOGIC ---
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Tránh nhầm lẫn giữa click và drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Order';
    const isOverTask = over.data.current?.type === 'Order';
    const isOverColumn = COLUMNS.some(col => col.id === overId);

    if (!isActiveTask) return;

    // Kéo thả giữa các Order (cùng cột hoặc khác cột)
    if (isActiveTask && isOverTask) {
      setOrders(orders => {
        const activeIndex = orders.findIndex(t => t.id === activeId);
        const overIndex = orders.findIndex(t => t.id === overId);

        if (orders[activeIndex].status !== orders[overIndex].status) {
          // Khác cột -> Chuyển cột và cập nhật status (cập nhật màu sắc Kanban)
          const updatedOrders = [...orders];
          const newStatus = orders[overIndex].status;
          updatedOrders[activeIndex] = { 
            ...updatedOrders[activeIndex], 
            status: newStatus,
            color: newStatus === 'pending' ? 'gray' : newStatus === 'producing' ? 'blue' : 'purple'
          };
          return arrayMove(updatedOrders, activeIndex, overIndex);
        }
        // Cùng cột -> Chỉ sắp xếp lại
        return arrayMove(orders, activeIndex, overIndex);
      });
    }

    // Kéo thả vào Cột trống
    if (isActiveTask && isOverColumn) {
      setOrders(orders => {
        const activeIndex = orders.findIndex(t => t.id === activeId);
        const updatedOrders = [...orders];
        const newStatus = overId as string;
        updatedOrders[activeIndex] = { 
          ...updatedOrders[activeIndex], 
          status: newStatus,
          color: newStatus === 'pending' ? 'gray' : newStatus === 'producing' ? 'blue' : 'purple'
        };
        // Dịch chuyển item xuống cuối danh sách của cột đó
        return arrayMove(updatedOrders, activeIndex, updatedOrders.length - 1);
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    // Logic thay đổi thứ tự đã được xử lý ở onDragOver, onDragEnd chỉ để gọi API nếu cần
    // Ví dụ: supabase.from('orders').update({ status: orders.find(o => o.id === activeId).status }).eq('id', activeId)
  };

  const getActiveOrder = () => {
    return orders.find(o => o.id === activeId);
  };


  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col z-20 shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-gray-100">
          <div className="w-8 h-8 bg-gray-900 text-white flex items-center justify-center rounded-lg font-bold">M</div>
          <h1 className="text-xl font-bold tracking-tight">Miên Man</h1>
        </div>
        
        <nav className="flex-1 p-4 flex flex-col gap-1">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${activeTab === 'orders' ? 'bg-blue-50 text-blue-700 font-bold' : 'font-medium text-gray-600 hover:bg-gray-100'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
            Đơn hàng
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${activeTab === 'products' ? 'bg-blue-50 text-blue-700 font-bold' : 'font-medium text-gray-600 hover:bg-gray-100'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
            Kho & Sản phẩm
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${activeTab === 'history' ? 'bg-blue-50 text-blue-700 font-bold' : 'font-medium text-gray-600 hover:bg-gray-100'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Lịch sử đơn
          </button>

          <div className="border-t border-gray-100 my-2"></div>

          <button
            onClick={() => setActiveTab('customers')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${activeTab === 'customers' ? 'bg-blue-50 text-blue-700 font-bold' : 'font-medium text-gray-600 hover:bg-gray-100'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            Khách hàng
          </button>
        </nav>

        <div className="p-3 border-t border-gray-100">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Về trang Shop
          </Link>
        </div>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-bold">Admin</p>
              <p className="text-xs text-green-600 font-bold flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 block"></span> Supabase ON</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* HEADER */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm z-10">
          <h2 className="text-xl font-bold text-gray-800">
            {activeTab === 'orders' && 'Quản lý Đơn hàng'}
            {activeTab === 'products' && 'Kho & Sản phẩm'}
            {activeTab === 'customers' && 'Khách hàng & Liên hệ'}
            {activeTab === 'history' && 'Lịch sử Đơn hàng'}
          </h2>
          <div className="flex items-center gap-2">
            {activeTab === 'orders' && <button className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-gray-800">Tạo đơn thủ công</button>}
            {activeTab === 'products' && <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-blue-700" onClick={() => setProductModal({})}>+ Thêm sản phẩm</button>}
            {activeTab === 'customers' && <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-bold hover:bg-gray-50 flex items-center gap-2">Xuất CSV</button>}
            {activeTab === 'history' && (
              <>
                <button onClick={() => setShowArchiveInfo(!showArchiveInfo)} className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-50 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Chính sách lưu trữ
                </button>
                <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-green-700 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  Xuất Excel
                </button>
              </>
            )}
          </div>
        </header>

        {/* CONTENT PANELS */}
        <div className="flex-1 overflow-hidden relative">
          
          {/* ORDERS KANBAN */}
          {activeTab === 'orders' && (
            <DndContext 
              sensors={sensors} 
              collisionDetection={closestCorners} 
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <div className="flex gap-6 overflow-x-auto p-6 h-full items-start bg-gray-50">
                {COLUMNS.map(col => {
                  const columnOrders = orders.filter(o => o.status === col.id);
                  return (
                    <div key={col.id} className={`min-w-[300px] w-[300px] rounded-xl flex flex-col max-h-full shrink-0 ${col.containerClass}`}>
                      <div className={`p-4 font-semibold flex justify-between items-center ${col.borderTop ? col.borderTop + ' rounded-t-xl' : 'text-gray-700 border-b border-black/5'} shrink-0`}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${col.colorClass}`}></div>
                          <span className={col.titleColor || ''}>{col.title}</span>
                        </div>
                        <span className={`text-xs py-0.5 px-2 rounded-full font-bold ${col.badgeClass}`}>{columnOrders.length}</span>
                      </div>
                      
                      <div className="p-3 flex-1 overflow-y-auto flex flex-col gap-3">
                        <SortableContext 
                          id={col.id}
                          items={columnOrders.map(o => o.id)} 
                          strategy={verticalListSortingStrategy}
                        >
                          {columnOrders.map(order => (
                            <SortableOrderCard key={order.id} order={order} onClick={() => setOrderModal({ ...order, uiStatus: col.title })} />
                          ))}
                        </SortableContext>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Hộp hiệu ứng kéo thả mượt mà */}
              <DragOverlay dropAnimation={{
                sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }),
              }}>
                {activeId ? <SortableOrderCard order={getActiveOrder()} isOverlay /> : null}
              </DragOverlay>
            </DndContext>
          )}

          {/* PRODUCTS VIEW */}
          {activeTab === 'products' && (
            <div className="h-full overflow-y-auto p-6 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm"><h3 className="text-sm font-medium text-gray-500 mb-1">Tổng Sản Phẩm</h3><p className="text-2xl font-bold text-gray-900">42</p></div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Cảnh Báo Kho</h3>
                  <div className="flex items-center gap-2"><p className="text-2xl font-bold text-red-600">3</p><span className="text-xs font-medium bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Sắp hết</span></div>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
                      <th className="p-4 font-bold">Sản phẩm</th>
                      <th className="p-4 font-bold text-gray-400">Giá Cost</th>
                      <th className="p-4 font-bold">Giá bán cuối</th>
                      <th className="p-4 font-bold">Tồn kho</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {MOCK_PRODUCTS.map((prod, i) => (
                      <tr key={i} className="hover:bg-gray-50 cursor-pointer transition" onClick={() => setProductModal(prod)}>
                        <td className="p-4 flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded flex items-center justify-center font-bold">{prod.avatar}</div>
                          <div><p className="font-bold text-sm text-gray-900">{prod.name}</p></div>
                        </td>
                        <td className="p-4 text-sm text-gray-400 font-mono">{prod.cost}</td>
                        <td className="p-4 font-bold text-sm">
                          {prod.discount ? (
                            <>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-400 line-through text-xs font-normal">{prod.originalPrice}</span>
                                <span className="text-red-600 bg-red-50 text-[10px] px-1 py-0.5 rounded">-{prod.discount}</span>
                              </div>
                              <span className="text-gray-900">{prod.finalPrice}</span>
                            </>
                          ) : (
                            <span className="text-gray-900">{prod.finalPrice}</span>
                          )}
                        </td>
                        <td className="p-4">
                          {prod.alert ? (
                            <span className="text-xs font-bold text-red-600">⚠ {prod.stock} (Hết hàng)</span>
                          ) : (
                            <span className="text-xs font-bold text-green-600">{prod.stock} (Còn hàng)</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CUSTOMERS VIEW */}
          {activeTab === 'customers' && (
            <div className="h-full overflow-y-auto p-6 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm"><h3 className="text-sm font-medium text-gray-500 mb-1">Tổng Khách Hàng</h3><p className="text-2xl font-bold text-gray-900">1,248</p></div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm"><h3 className="text-sm font-medium text-gray-500 mb-1">Khách Mới (Tuần)</h3><p className="text-2xl font-bold text-green-600">+42</p></div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm"><h3 className="text-sm font-medium text-gray-500 mb-1">Thành viên VIP</h3><p className="text-2xl font-bold text-yellow-600">15</p></div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-gray-200 text-xs uppercase text-gray-500">
                      <th className="p-4 font-bold">Khách hàng (Tên/Email)</th>
                      <th className="p-4 font-bold">Liên hệ</th>
                      <th className="p-4 font-bold text-center">Số đơn hàng</th>
                      <th className="p-4 font-bold">Tổng chi tiêu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {MOCK_CUSTOMERS.map((cus, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => setCustomerModal(cus)}>
                        <td className="p-4 flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border ${cus.vip ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-purple-100 text-purple-700 border-purple-200'}`}>
                            {cus.avatar}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{cus.name} {cus.vip && <span className="bg-yellow-100 text-yellow-700 text-[10px] px-1.5 py-0.5 rounded ml-1 uppercase">VIP</span>}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{cus.email}</p>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-gray-600">📞 {cus.phone}</td>
                        <td className="p-4 font-bold text-gray-900 text-sm text-center">{cus.orders}</td>
                        <td className={`p-4 font-bold text-sm ${cus.vip ? 'text-green-600' : 'text-gray-600'}`}>{cus.spent}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* HISTORY VIEW */}
          {activeTab === 'history' && (() => {
            const filtered = historyFilter === 'all' ? ORDER_HISTORY : ORDER_HISTORY.filter(o => o.status === historyFilter);
            const deliveredCount = ORDER_HISTORY.filter(o => o.status === 'delivered').length;
            const cancelledCount = ORDER_HISTORY.filter(o => o.status === 'cancelled').length;
            const refundedCount = ORDER_HISTORY.filter(o => o.status === 'refunded').length;
            const totalRevenue = ORDER_HISTORY.filter(o => o.status === 'delivered').reduce((sum, o) => sum + parseInt(o.price.replace(/[^\d]/g, '')), 0);

            return (
              <div className="h-full overflow-y-auto p-6 bg-gray-50">

                {/* Archive Info Banner */}
                {showArchiveInfo && (
                  <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-5 relative">
                    <button onClick={() => setShowArchiveInfo(false)} className="absolute top-3 right-3 text-blue-400 hover:text-blue-600 text-sm">✕</button>
                    <h3 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                      Chính sách lưu trữ & Archive tự động
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-white/60 rounded-lg p-3 border border-blue-100">
                        <p className="text-blue-600 font-bold text-xs uppercase mb-1">Thời gian lưu trong DB</p>
                        <p className="font-bold text-blue-900">{ARCHIVE_POLICY.keepInDb} ngày (≈ 2 tháng)</p>
                      </div>
                      <div className="bg-white/60 rounded-lg p-3 border border-blue-100">
                        <p className="text-blue-600 font-bold text-xs uppercase mb-1">Lịch archive</p>
                        <p className="font-bold text-blue-900">{ARCHIVE_POLICY.schedule}</p>
                      </div>
                      <div className="bg-white/60 rounded-lg p-3 border border-blue-100">
                        <p className="text-blue-600 font-bold text-xs uppercase mb-1">Định dạng xuất</p>
                        <p className="font-bold text-blue-900 uppercase">{ARCHIVE_POLICY.autoExportFormat}</p>
                      </div>
                      <div className="bg-white/60 rounded-lg p-3 border border-blue-100">
                        <p className="text-blue-600 font-bold text-xs uppercase mb-1">Lưu tại</p>
                        <p className="font-bold text-blue-900 text-xs">{ARCHIVE_POLICY.exportFolder}</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <p className="text-xs text-blue-700"><strong>Dữ liệu bao gồm:</strong> {ARCHIVE_POLICY.includes.join(' • ')}</p>
                    </div>
                  </div>
                )}

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Tổng đơn lịch sử</h3>
                    <p className="text-2xl font-bold text-gray-900">{ORDER_HISTORY.length}</p>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Giao thành công</h3>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold text-green-600">{deliveredCount}</p>
                      <span className="text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded">{Math.round(deliveredCount / ORDER_HISTORY.length * 100)}%</span>
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Hủy / Hoàn</h3>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold text-red-500">{cancelledCount + refundedCount}</p>
                      <span className="text-xs font-medium text-red-600 bg-red-50 px-1.5 py-0.5 rounded">{cancelledCount} hủy, {refundedCount} hoàn</span>
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Doanh thu (đã giao)</h3>
                    <p className="text-2xl font-bold text-emerald-600">{totalRevenue.toLocaleString('vi-VN')}đ</p>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 mb-4">
                  {([
                    { key: 'all', label: 'Tất cả', count: ORDER_HISTORY.length },
                    { key: 'delivered', label: 'Giao thành công', count: deliveredCount },
                    { key: 'cancelled', label: 'Đã hủy', count: cancelledCount },
                    { key: 'refunded', label: 'Đã hoàn', count: refundedCount },
                  ] as const).map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setHistoryFilter(tab.key)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                        historyFilter === tab.key
                          ? tab.key === 'delivered' ? 'bg-green-100 text-green-800 font-bold'
                            : tab.key === 'cancelled' ? 'bg-red-100 text-red-800 font-bold'
                            : tab.key === 'refunded' ? 'bg-amber-100 text-amber-800 font-bold'
                            : 'bg-gray-200 text-gray-800 font-bold'
                          : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {tab.label}
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${historyFilter === tab.key ? 'bg-white/50' : 'bg-gray-100'}`}>{tab.count}</span>
                    </button>
                  ))}
                </div>

                {/* History Table */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
                        <th className="p-4 font-bold">Mã đơn</th>
                        <th className="p-4 font-bold">Khách hàng</th>
                        <th className="p-4 font-bold">Sản phẩm</th>
                        <th className="p-4 font-bold">Trạng thái</th>
                        <th className="p-4 font-bold">Ngày đặt</th>
                        <th className="p-4 font-bold">Ngày kết thúc</th>
                        <th className="p-4 font-bold text-right">Giá trị</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filtered.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50 transition group">
                          <td className="p-4">
                            <span className="font-bold text-gray-900 text-sm font-mono">{order.id}</span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                order.status === 'delivered' ? 'bg-green-100 text-green-700' : order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                              }`}>{order.avatar}</div>
                              <span className="text-sm font-medium text-gray-800">{order.name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-gray-600 max-w-[200px] truncate">{order.items}</td>
                          <td className="p-4">
                            {order.status === 'delivered' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                Giao thành công
                              </span>
                            )}
                            {order.status === 'cancelled' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                                Đã hủy
                              </span>
                            )}
                            {order.status === 'refunded' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
                                Hoàn tiền
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-sm text-gray-500 font-mono">{order.orderedAt}</td>
                          <td className="p-4 text-sm font-mono">
                            {order.status === 'delivered' && <span className="text-green-700">{(order as any).completedAt}</span>}
                            {order.status === 'cancelled' && <span className="text-red-600">{(order as any).cancelledAt}</span>}
                            {order.status === 'refunded' && <span className="text-amber-700">{(order as any).refundedAt}</span>}
                          </td>
                          <td className="p-4 text-right">
                            <span className={`font-bold text-sm ${order.status === 'delivered' ? 'text-gray-900' : 'text-gray-400 line-through'}`}>
                              {order.price}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Cancelled / Refunded Reasons */}
                {(historyFilter === 'cancelled' || historyFilter === 'refunded' || historyFilter === 'all') && filtered.some(o => o.status !== 'delivered') && (
                  <div className="mt-6 bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                    <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                      Lý do hủy / hoàn
                    </h3>
                    <div className="space-y-2">
                      {filtered.filter(o => o.status !== 'delivered').map(order => (
                        <div key={order.id} className={`flex items-start gap-3 p-3 rounded-lg border ${order.status === 'cancelled' ? 'bg-red-50/50 border-red-100' : 'bg-amber-50/50 border-amber-100'}`}>
                          <span className="font-mono text-xs font-bold text-gray-500 mt-0.5 shrink-0">{order.id}</span>
                          <p className="text-sm text-gray-700">{order.reason}</p>
                          <span className={`ml-auto text-xs font-bold shrink-0 px-2 py-0.5 rounded ${order.status === 'cancelled' ? 'text-red-700 bg-red-100' : 'text-amber-700 bg-amber-100'}`}>
                            {order.status === 'cancelled' ? 'Hủy' : 'Hoàn'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Retention Timeline */}
                <div className="mt-6 bg-gray-100/80 border border-gray-200 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">Dữ liệu đang hiển thị trong vòng <strong className="text-gray-900">{RETENTION_DAYS} ngày gần nhất</strong>. Đơn cũ hơn sẽ được xuất file Excel tự động mỗi đầu tháng rồi xóa khỏi DB.</p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </main>

      {/* OVERLAY */}
      <div 
        className={`fixed inset-0 bg-gray-900/40 z-40 backdrop-blur-sm transition-opacity duration-300 ${hasAnyModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={closeAllModals}
      />

      {/* SLIDE-OVER: ORDER */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-[450px] bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${orderModal ? 'translate-x-0' : 'translate-x-full'}`}>
        {orderModal && (
          <>
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between bg-white z-10 shrink-0">
              <div>
                <h2 className="text-xl font-bold">Đơn {orderModal.id}</h2>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold ${orderModal.color === 'gray' ? 'bg-gray-200 text-gray-800' : orderModal.color === 'blue' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                  {orderModal.uiStatus}
                </span>
              </div>
              <button onClick={closeAllModals} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full h-fit">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
              
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xl shrink-0">{orderModal.avatar}</div>
                <div className="space-y-1 text-sm flex-1">
                  <p className="font-bold text-gray-900">{orderModal.name}</p>
                  <p className="text-gray-600">📞 0987 654 321</p>
                  <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-100">
                    <p className="text-gray-700 text-xs">Landmark 81, Vinhomes Central Park, Bình Thạnh, TP.HCM</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">Sản phẩm</h3>
                <div className="flex gap-4 items-center p-2 bg-gray-50 border border-gray-100 rounded-lg">
                  <img src="https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=100&q=80" alt="Item" className="w-12 h-12 object-cover rounded-md border border-gray-200 shrink-0"/>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-sm">{orderModal.items}</h4>
                    <a href="#" className="text-xs text-blue-600 font-medium hover:underline mt-1 inline-block">🔗 Xem file thiết kế đính kèm</a>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-gray-500 text-xs uppercase">Thanh toán</span>
                    <div className="flex items-center gap-1 text-sm font-bold">
                      {orderModal.paymentMethod === 'MOMO' && <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded text-xs">MoMo</span>}
                      {orderModal.paymentMethod === 'VNPAY' && <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">VNPay</span>}
                      {orderModal.paymentMethod === 'COD' && <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs">Nhận hàng thanh toán</span>}
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <span className={`font-bold text-sm ${orderModal.paymentMethod !== 'COD' ? 'text-green-600' : 'text-gray-700'}`}>
                      {orderModal.paymentMethod !== 'COD' ? 'Khách đã thanh toán' : 'Cần thu hộ (COD)'}
                    </span>
                    <span className="font-bold text-lg text-red-600">{orderModal.price}</span>
                  </div>
                </div>
              </div>

              {/* Người đảm nhận (Admin only) */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">Người đảm nhận</h3>
                {orderModal.assignee ? (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${orderModal.assignee.color}`}>
                      {orderModal.assignee.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-sm">{orderModal.assignee.name}</p>
                      <p className="text-xs text-gray-500">{orderModal.assignee.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">📞 {orderModal.assignee.phone}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 p-4 bg-yellow-50 rounded-lg border border-yellow-200 border-dashed">
                    <p className="text-sm font-bold text-yellow-700">Chưa phân công</p>
                    <select className="text-xs border border-gray-300 rounded-md py-1.5 px-2 bg-white text-gray-700 cursor-pointer">
                      <option value="">— Chọn người đảm nhận —</option>
                      {STAFF.map(s => <option key={s.avatar} value={s.name}>{s.name} — {s.role}</option>)}
                    </select>
                  </div>
                )}
              </div>

              {/* Git Timeline — Collapsible */}
              <details className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors select-none">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Tiến trình sản xuất (Git Timeline)</h3>
                  <svg className="w-4 h-4 text-gray-400 transition-transform [details[open]>&]:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </summary>
                <div className="px-2 pb-4 -mt-2">
                  <GitProgressTracker
                    orderId={orderModal.id}
                    steps={buildOrderSteps(orderModal)}
                    compact
                  />
                </div>
              </details>
            </div>
          </>
        )}
      </div>

      {/* SLIDE-OVER: PRODUCT */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-[450px] bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${productModal ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between bg-white z-10 shrink-0">
          <h2 className="text-xl font-bold">{productModal?.name ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
          <button onClick={closeAllModals} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full h-fit">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 bg-white space-y-6">
          <div>
            <label className="block text-sm font-bold mb-1 text-gray-900">Tên sản phẩm</label>
            <input type="text" defaultValue={productModal?.name} placeholder="VD: Túi Tote" className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1 text-gray-600">Giá vốn (Cost)</label>
              <input type="text" defaultValue={productModal?.cost?.replace('đ','')} placeholder="150000" className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm font-mono outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1 text-gray-900">Giá bán gốc</label>
              <input type="text" defaultValue={productModal?.originalPrice?.replace('đ','')} placeholder="350000" className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm font-mono outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1 text-red-600">% Giảm giá</label>
              <div className="relative">
                <input type="number" defaultValue={productModal?.discount?.replace('%','')} placeholder="0" className="w-full border border-red-300 text-red-700 rounded-md py-2 px-3 text-sm bg-red-50 focus:ring-red-500 outline-none font-bold pr-8" />
                <span className="absolute right-3 top-2 text-red-500 font-bold">%</span>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1 text-gray-900">Kho & Biến thể</label>
            <div className="border border-gray-200 rounded-lg bg-gray-50 p-4 text-center text-gray-500 text-sm">
              [ Form nhập biến thể & Tồn kho JSONB sẽ render tại đây ]
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-3 shrink-0">
          <button onClick={closeAllModals} className="flex-1 bg-white border border-gray-300 py-2.5 rounded-lg font-bold text-sm text-gray-700">Hủy</button>
          <button className="flex-[2] bg-blue-600 text-white py-2.5 rounded-lg font-bold text-sm shadow-sm hover:bg-blue-700">Lưu Dữ Liệu</button>
        </div>
      </div>

      {/* SLIDE-OVER: CUSTOMER */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-[450px] bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${customerModal ? 'translate-x-0' : 'translate-x-full'}`}>
        {customerModal && (
          <>
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between bg-white z-10 shrink-0">
              <h2 className="text-xl font-bold text-gray-900">Hồ sơ khách hàng</h2>
              <button onClick={closeAllModals} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full h-fit">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center text-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center font-bold text-3xl mb-3 border-4 border-white shadow-sm ${customerModal.vip ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                  {customerModal.avatar}
                </div>
                <h3 className="font-bold text-xl text-gray-900">{customerModal.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{customerModal.email}</p>
                
                <div className="flex items-center gap-4 mt-4 w-full border-t border-gray-100 pt-4">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase font-bold">Tổng đơn</p>
                    <p className="text-lg font-bold text-gray-900 mt-1">{customerModal.orders}</p>
                  </div>
                  <div className="w-px h-8 bg-gray-200"></div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase font-bold">Tổng chi</p>
                    <p className="text-lg font-bold text-green-600 mt-1">{customerModal.spent}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Sổ địa chỉ (Addresses)</h3>
                <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg relative">
                  <span className="absolute top-3 right-3 text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">Mặc định</span>
                  <p className="text-sm font-bold text-gray-800">📞 {customerModal.phone}</p>
                  <p className="text-xs text-gray-600 mt-1">Tòa nhà Landmark 81, Vinhomes Central Park, Phường 22, Bình Thạnh, TP.HCM</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
