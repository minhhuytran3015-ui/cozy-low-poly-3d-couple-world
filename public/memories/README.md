# Thư mục chứa ảnh và video kỷ niệm (Memories)

Hãy đặt ảnh và video của hai bạn vào thư mục này:
- Định dạng ảnh hỗ trợ: `.jpg`, `.jpeg`, `.png`, `.webp`
- Định dạng video hỗ trợ: `.mp4`, `.webm`

Ví dụ đặt tên file:
- `photo-01.jpg`
- `photo-02.jpg`
- `video-03.mp4`

Sau khi copy file vào thư mục này, mở tệp `src/data/memories.ts` và điền đường dẫn, ví dụ:
```typescript
src: '/memories/photo-01.jpg'
```
Website sẽ tự động nạp ảnh thật lên khung tranh 3D trên tường và trong modal xem kỷ niệm!
